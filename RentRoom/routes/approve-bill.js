const express = require("express");
const router = express.Router();
const db = require("../config/database");

// ดึงข้อมูลการชำระเงินโดยใช้ bill_id
router.get('/details/:bill_id', (req, res) => {
    const billId = req.params.bill_id;

    const sql = `
        SELECT transfer_date, transfer_time, slip_image 
        FROM payments 
        WHERE bill_id = ?;
    `;

    db.get(sql, [billId], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
        }

        if (!row) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลการชำระเงิน' });
        }

        res.json({ success: true, ...row });
    });
});

// อนุมัติการชำระเงิน
router.post('/approve/:bill_id', (req, res) => {
    const billId = req.params.bill_id;

    console.log('ได้รับคำขออนุมัติสำหรับ bill_id:', billId); // ตรวจสอบ bill_id

    const sql = `
        UPDATE bills 
        SET status = 'paid' 
        WHERE bill_id = ?;
    `;

    db.run(sql, [billId], function (err) {
        if (err) {
            console.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ:', err); // ตรวจสอบข้อผิดพลาด
            return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
        }

        if (this.changes === 0) {
            console.log('ไม่พบบิลที่ต้องการอนุมัติสำหรับ bill_id:', billId); // ตรวจสอบ bill_id
            return res.status(404).json({ success: false, message: 'ไม่พบบิลที่ต้องการอนุมัติ' });
        }

        console.log('อนุมัติการชำระเงินสำเร็จสำหรับ bill_id:', billId); // ตรวจสอบ bill_id
        res.json({ success: true, message: 'อนุมัติการชำระเงินสำเร็จ' });
    });
});

module.exports = router;