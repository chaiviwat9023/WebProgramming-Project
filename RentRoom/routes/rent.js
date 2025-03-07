const express = require("express");
const router = express.Router();
const db = require("../config/database"); // นำเข้า database.js

router.get("/", (req, res) => {
    const roomId = req.query.room_id; // รับค่า room_id จาก URL
    const userId = req.session.user.id; // รับค่า user_id จาก session

    // ตรวจสอบว่าได้ค่า room_id มาหรือไม่
    if (!roomId) {
        return res.status(400).send("Room ID is required");
    }

    if (!userId) {
        return res.status(400).send("User ID is required");
    }

    // สร้าง SQL Query เพื่อ insert ข้อมูลการจอง
    const query = `
        INSERT INTO reservations (room_id, user_id, reservation_date)
        VALUES (?, ?, date('now'));
    `;

    // ใช้ db.run สำหรับการ insert ข้อมูล
    db.run(query, [roomId, userId], function (err) {
        if (err) {
            console.error("Error inserting reservation: ", err);
            return res.status(500).send("Error inserting reservation");
        }
        // ส่งคำตอบกลับว่า "success"
        res.send("success");
    });
});

module.exports = router;
