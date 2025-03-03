const express = require("express");
const router = express.Router();
const db = require("../config/database"); // นำเข้า database.js

// ดึงรายการห้องทั้งหมด
router.get('/', (req, res) => {
    db.all("SELECT room_id FROM rooms", (err, rows) => {
        if (err) {
            console.error("❌ Error fetching rooms:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json(rows); // ส่งข้อมูลกลับเป็น JSON
    });
});


// ดึงข้อมูลห้องตาม room_id
router.get("/:roomId", (req, res) => {
    const { roomId } = req.params;

    db.get("SELECT * FROM rooms WHERE room_id = ?", [roomId], (err, room) => {
        if (err) {
            console.error("❌ Error fetching room:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (!room) return res.status(404).json({ error: "Room not found" });

        res.json(room); // ส่งข้อมูลห้องกลับเป็น JSON
    });
});


module.exports = router;
