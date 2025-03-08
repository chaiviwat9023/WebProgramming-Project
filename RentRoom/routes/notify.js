const express = require("express");
const router = express.Router();
const db = require("../config/database"); // นำเข้า database.js

// ดึงข้อมูลการแจ้งเตือน
router.get('/', (req, res) => {
    const userId = req.session.user.id; // ไอดีของผู้ใช้ที่ล็อกอิน

    const sql = `
        SELECT notification_id, message, status, created_at 
        FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC;
    `;

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        console.log(rows); // ตรวจสอบข้อมูลใน terminal
        res.render('notify', { notifications: rows }); // ส่งข้อมูลเป็นตัวแปร notifications
    });
});

// อัปเดตสถานะการแจ้งเตือนเป็น "อ่านแล้ว"
router.post("/:id", (req, res) => {
    const notificationId = req.params.id;

    const query = `
        UPDATE notifications 
        SET status = 'read' 
        WHERE notification_id = ?;
    `;

    db.run(query, [notificationId], function (err) {
        if (err) {
            console.error("Error updating notification status:", err);
            return res.status(500).json({ success: false, error: "Internal Server Error" });
        }

        res.json({ success: true });
    });
});

module.exports = router;