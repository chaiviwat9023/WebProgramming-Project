const express = require("express");
const router = express.Router();
const db = require("../config/database"); // นำเข้า database.js

router.get("/", (req, res) => {
    const userId = req.session.user.id; // ไอดีของผู้ใช้ที่ล็อกอิน

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
        WHERE status != 'paid'
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

    // ใช้ Promise.all() เพื่อดึงข้อมูลทั้งสองชุด
    Promise.all([
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
    .then(([bills, reservations]) => {
        res.render("management", { bills, reservations });
    })
    .catch((err) => {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", err.message);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    });
});

module.exports = router;