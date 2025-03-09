const express = require("express");
const router = express.Router();
const db = require("../config/database"); // นำเข้า database.js

router.get("/", (req, res) => {
    const userId = req.session.user.id; // ไอดีของผู้ใช้ที่ล็อกอิน

    // SQL query สำหรับนับห้องว่าง (owner_id เป็น null)
    const sqlEmptyRooms = `
        SELECT COUNT(*) AS empty_rooms
        FROM rooms
        WHERE owner_id IS NULL;
    `;

    // SQL query สำหรับนับบิลที่รอยืนยัน (status = 'pending')
    const sqlPendingBills = `
        SELECT COUNT(*) AS pending_bills
        FROM bills
        WHERE status = 'pending';
    `;

    // SQL query สำหรับนับการจองที่รออนุมัติ (status = 'pending')
    const sqlPendingReservations = `
        SELECT COUNT(*) AS pending_reservations
        FROM reservations
        WHERE status = 'pending';
    `;

    // SQL query สำหรับดึงข้อมูลบิลและการจอง (เดิม)
    const sqlBills = `
        SELECT 
            b.bill_id, 
            b.billing_cycle, 
            b.room_id, 
            b.user_id, 
            (b.rent + b.water + b.electricity) AS total, 
            CASE b.status 
                WHEN 'pending' THEN 'รอดำเนินการ' 
                WHEN 'paid' THEN 'ชำระเงินสำเร็จ' 
                WHEN 'rejected' THEN 'ปฏิเสธ' 
                WHEN 'overdue' THEN 'ค้างชำระ' 
            END AS status
        FROM bills b
        WHERE status = 'pending'
        ORDER BY b.billing_cycle DESC;
    `;

    const sqlReservations = `
        SELECT reservation_id, reservation_date, room_id, user_id,
            CASE status 
                WHEN 'pending' THEN 'รอดำเนินการ' 
                WHEN 'approved' THEN 'อนุมัติ' 
                WHEN 'rejected' THEN 'ปฏิเสธ' 
                WHEN 'canceled' THEN 'ยกเลิก' 
            END AS status
        FROM reservations
        WHERE status != 'approved';
    `;

    // ใช้ Promise.all() เพื่อดึงข้อมูลทั้งหมด
    Promise.all([
        new Promise((resolve, reject) => {
            db.get(sqlEmptyRooms, [], (err, row) => {
                if (err) reject(err);
                else resolve(row.empty_rooms);
            });
        }),
        new Promise((resolve, reject) => {
            db.get(sqlPendingBills, [], (err, row) => {
                if (err) reject(err);
                else resolve(row.pending_bills);
            });
        }),
        new Promise((resolve, reject) => {
            db.get(sqlPendingReservations, [], (err, row) => {
                if (err) reject(err);
                else resolve(row.pending_reservations);
            });
        }),
        new Promise((resolve, reject) => {
            db.all(sqlBills, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        }),
        new Promise((resolve, reject) => {
            db.all(sqlReservations, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        })
    ])
    .then(([emptyRooms, pendingBills, pendingReservations, bills, reservations]) => {
        // ส่งข้อมูลไปยังหน้า Dashboard
        res.render("management", {
            emptyRooms: emptyRooms, // จำนวนห้องว่าง
            pendingBills: pendingBills, // จำนวนบิลที่รอยืนยัน
            pendingReservations: pendingReservations, // จำนวนการจองที่รออนุมัติ
            bills: bills, // ข้อมูลบิล
            reservations: reservations // ข้อมูลการจอง
        });
    })
    .catch((err) => {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", err.message);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    });
});

module.exports = router;