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

// เพิ่มห้องใหม่ (POST)
router.post("/", (req, res) => {
    const {
        room_id,
        size,
        type,
        capacity,
        floor,
        furniture,
        rent_price,
        deposit,
        electricity_price,
        water_price,
        internet,
    } = req.body;

    const query = `
        INSERT INTO rooms (room_id, size, type, capacity, floor, furniture, rent_price, deposit, electricity_price, water_price, internet)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        room_id,
        size,
        type,
        capacity,
        floor,
        furniture,
        rent_price,
        deposit,
        electricity_price,
        water_price,
        internet,
    ];

    db.run(query, params, function (err) {
        if (err) {
            console.error("❌ Error adding new room:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ message: "Room added successfully", roomId: room_id });
    });
});

// อัปเดตห้องที่มีอยู่ (PUT)
router.put("/:roomId", (req, res) => {
    const { roomId } = req.params;
    const {
        size,
        type,
        capacity,
        floor,
        furniture,
        rent_price,
        deposit,
        electricity_price,
        water_price,
        internet,
    } = req.body;

    const query = `
        UPDATE rooms
        SET size = ?, type = ?, capacity = ?, floor = ?, furniture = ?, rent_price = ?, deposit = ?, electricity_price = ?, water_price = ?, internet = ?
        WHERE room_id = ?
    `;
    const params = [
        size,
        type,
        capacity,
        floor,
        furniture,
        rent_price,
        deposit,
        electricity_price,
        water_price,
        internet,
        roomId,
    ];

    db.run(query, params, function (err) {
        if (err) {
            console.error("❌ Error updating room:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ message: "Room updated successfully", roomId: roomId });
    });
});

module.exports = router;
