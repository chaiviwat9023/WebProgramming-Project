const express = require("express");
const router = express.Router();
const db = require("../config/database"); // นำเข้า database.js

router.get("/", (req, res) => {
    const roomId = req.query.room_id; // รับค่า room_id จาก URL
    const userId = req.session.user ? req.session.user.id : null; // รับค่า user_id จาก session

    // ตรวจสอบว่าได้ค่า room_id มาหรือไม่
    if (!roomId) {
        return res.status(400).send("Room ID is required");
    }

    // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
    if (!userId) {
        return res.status(400).send("กรุณาล็อกอิน");
    }

    // สร้าง SQL Query เพื่อตรวจสอบว่ามีการจองห้องโดยผู้ใช้คนนั้นแล้วหรือไม่
    const checkQuery = `
        SELECT * FROM reservations 
        WHERE room_id = ? AND user_id = ?;
    `;

    db.get(checkQuery, [roomId, userId], (err, row) => {
        if (err) {
            console.error("Error checking reservation: ", err);
            return res.status(500).send("Error checking reservation");
        }

        // ถ้ามีการจองแล้ว
        if (row) {
            return res.status(400).send("คุณไม่สามารถจองห้องซ้ำได้");
        }

        // ถ้ายังไม่มีการจอง ให้ทำการ insert ข้อมูลการจองใหม่
        const insertQuery = `
            INSERT INTO reservations (room_id, user_id, reservation_date)
            VALUES (?, ?, date('now'));
        `;

        db.run(insertQuery, [roomId, userId], function (err) {
            if (err) {
                console.error("Error inserting reservation: ", err);
                return res.status(500).send("Error inserting reservation");
            }
            // ส่งคำตอบกลับว่า "success"
            res.send("success");
        });
    });
});

module.exports = router;