const express = require("express");
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const db = require("../config/database"); // นำเข้า database.js

// ดึงข้อมูลบิลทั้งหมด
router.get('/', (req, res) => {
    const sql = `
        SELECT 
            bill_id, 
            billing_cycle, 
            rent, 
            water, 
            electricity, 
            (rent + water + electricity) AS total_amount, 
            CASE status 
                WHEN 'pending' THEN 'รอตรวจสอบ'
                WHEN 'paid' THEN 'อนุมัติ'
            END AS status 
        FROM bills;
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.render('payment', { data: rows });
    });
});

router.post('/submit', (req, res) => {
    const { bill_id, transfer_date, transfer_time, slip_image } = req.body;

    // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (!bill_id || !transfer_date || !transfer_time || !slip_image) {
        return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
    }

    // ตรวจสอบว่ามีข้อมูลการชำระเงินสำหรับ bill_id นี้อยู่แล้วหรือไม่
    const checkPaymentQuery = `
        SELECT * FROM payments WHERE bill_id = ?
    `;
    db.get(checkPaymentQuery, [bill_id], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล' });
        }

        if (row) {
            // หากมีข้อมูลอยู่แล้ว
            return res.status(400).json({ success: false, message: 'คุณได้ทำการส่งข้อมูลการชำระเรียบร้อยแล้ว กรุณารอตรวจสอบ' });
        }

        // หากไม่มีข้อมูล ให้บันทึกข้อมูลการชำระเงินใหม่
        const insertPaymentQuery = `
            INSERT INTO payments (bill_id, transfer_date, transfer_time, slip_image)
            VALUES (?, ?, ?, ?)
        `;
        db.run(insertPaymentQuery, [bill_id, transfer_date, transfer_time, slip_image], function (err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
            }

            // อัปเดตสถานะในตาราง bills เป็น 'pending'
            const updateBillQuery = `
                UPDATE bills SET status = 'pending' WHERE bill_id = ?
            `;
            db.run(updateBillQuery, [bill_id], function (err) {
                if (err) {
                    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะบิล' });
                }

                // ส่งผลลัพธ์กลับ
                res.json({ success: true, message: 'บันทึกข้อมูลสำเร็จ' });
            });
        });
    });
});

module.exports = router;