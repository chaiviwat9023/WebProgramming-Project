const express = require("express");
const router = express.Router();
const db = require("../config/database"); // นำเข้า database.js

// ดึงข้อมูลห้องทั้งหมดจากฐานข้อมูล
router.get("/", (req, res) => {
    // เพิ่มเงื่อนไข WHERE owner_id IS NULL เพื่อดึงเฉพาะห้องที่ไม่มีเจ้าของ
    const query = "SELECT * FROM rooms WHERE owner_id IS NULL";  
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
