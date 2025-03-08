const express = require("express");
const router = express.Router();
const db = require("../config/database"); // นำเข้า database.js

router.get('/', (req, res) => {
    const userId = req.session.user.id; // ไอดีของผู้ใช้ที่ล็อกอิน

    const sql = `
        SELECT reservation_id, reservation_date, room_id, user_id,
            CASE status 
                WHEN 'pending' THEN 'รอดำเนินการ' 
                WHEN 'approved' THEN 'อนุมัติ' 
                WHEN 'rejected' THEN 'ปฏิเสธ' 
                WHEN 'canceled' THEN 'ยกเลิก'
            END AS status
        FROM reservations
        WHERE user_id = ?;  -- กรองข้อมูลเฉพาะ user_id ที่ล็อกอิน
    `;

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.render('history', { data: rows });
    });
});

module.exports = router;