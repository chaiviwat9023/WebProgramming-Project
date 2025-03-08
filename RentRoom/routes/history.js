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


// API สำหรับลบการจอง
router.delete("/cancel/:id", (req, res) => {
    const reservationId = req.params.id;  // รับค่าจาก URL parameter
    console.log("ได้รับคำขอยกเลิก:", reservationId);  // Debugging

    const sql = "DELETE FROM reservations WHERE reservation_id = ?";
    db.run(sql, [reservationId], function (err) {
        if (err) {
            console.error("ลบไม่สำเร็จ:", err);
            return res.status(500).json({ success: false, message: "ลบไม่สำเร็จ" });
        }
        console.log("ลบสำเร็จ:", reservationId);
        res.json({ success: true, message: "ลบเรียบร้อยแล้ว" });
    });
});

module.exports = router;