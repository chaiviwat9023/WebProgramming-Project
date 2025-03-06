const express = require("express");
const router = express.Router();
const db = require("../config/database"); // นำเข้า database.js

// ดึงข้อมูลห้องทั้งหมดจากฐานข้อมูล
router.get("/", (req, res) => {
    const query = "SELECT * FROM rooms";  // สมมุติว่า 'rooms' เป็นชื่อตารางห้องพักในฐานข้อมูล
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Error retrieving rooms");
        }
        // ส่งข้อมูลห้องที่ดึงมาจากฐานข้อมูลไปที่ view
        res.render("choose", { rooms: rows });
    });
});

module.exports = router;
