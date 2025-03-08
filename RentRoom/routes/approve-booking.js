const express = require("express");
const router = express.Router();
const db = require("../config/database"); // นำเข้า database.js

// Route สำหรับการอนุมัติการจอง
router.post('/', (req, res) => {
    const { reservation_id, room_id, user_id } = req.body;

    // อัปเดตสถานะการจองเป็น 'approved'
    const updateReservationSql = `
        UPDATE reservations
        SET status = 'approved'
        WHERE reservation_id = ?;
    `;

    // เพิ่ม user_id เข้าไปใน owner_id ของตาราง rooms
    const updateRoomSql = `
        UPDATE rooms
        SET owner_id = ?
        WHERE room_id = ?;
    `;

    // เพิ่มการแจ้งเตือนไปยังผู้ใช้
    const insertNotificationSql = `
        INSERT INTO notifications (user_id, message, status)
        VALUES (?, ?, 'unread');
    `;

    db.serialize(() => {
        db.run(updateReservationSql, [reservation_id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            db.run(updateRoomSql, [user_id, room_id], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // สร้างข้อความแจ้งเตือน
                const notificationMessage = `การจองห้องหมายเลข ${room_id} ของคุณได้รับการอนุมัติแล้ว`;

                // แทรกข้อมูลการแจ้งเตือนลงในตาราง notifications
                db.run(insertNotificationSql, [user_id, notificationMessage], function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.json({ success: true });
                });
            });
        });
    });
});

module.exports = router;