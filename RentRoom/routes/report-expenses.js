const express = require("express");
const router = express.Router();
const db = require("../config/database");

// 📌 ดึงข้อมูลบิลทั้งหมด
router.get("/", (req, res) => {
    const query = `
        SELECT bills.*, rooms.room_id
        FROM bills
        JOIN rooms ON bills.room_id = rooms.room_id
    `;

    console.log("📥 Executing query to fetch all bills:", query);

    db.all(query, (err, rows) => {
        if (err) {
            console.error("❌ Error fetching bills:", err);
            return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
        }
        console.log("📊 Bills fetched successfully:", rows);
        res.json(rows);
    });
});

// 📌 เพิ่มบิลใหม่
router.post("/", (req, res) => {
    console.log("📥 Received data:", req.body);  // ✅ ตรวจสอบค่าที่รับเข้ามา

    // ตรวจสอบหากข้อมูลที่สำคัญหายไป
    const { roomNumber, billingCycle, rent, water, electricity, status } = req.body;
    if (!roomNumber || !billingCycle) {
        console.warn("⚠️ Missing required fields: roomNumber or billingCycle");
        return res.status(400).json({ message: "กรุณากรอกหมายเลขห้องและรอบบิล" });
    }

    const rentAmount = parseFloat(rent) || 0;
    const waterAmount = parseFloat(water) || 0;
    const electricityAmount = parseFloat(electricity) || 0;
    const billStatus = status || 'pending';

    console.log("📊 Parsed values - rent:", rentAmount, "water:", waterAmount, "electricity:", electricityAmount, "status:", billStatus);

    const userQuery = "SELECT owner_id FROM rooms WHERE room_id = ?";

    // เช็คว่าค่าที่เราส่งไปถูกต้องหรือไม่
    console.log(`📥 Executing query: ${userQuery} with roomNumber: ${roomNumber}`);
    
    db.get(userQuery, [roomNumber], (err, user) => {
        if (err) {
            console.error("❌ Error fetching user:", err);
            return res.status(500).json({ message: "เกิดข้อผิดพลาดในการค้นหาผู้ใช้งาน", error: err.message });
        }
        
        if (!user) {
            console.warn("⚠️ ไม่พบผู้ใช้งานที่เชื่อมโยงกับห้องนี้");
            return res.status(404).json({ message: "ไม่พบผู้ใช้งานที่เชื่อมโยงกับห้องนี้" });
        }

        console.log("✅ Found user ID:", user.owner_id); // ✅ ตรวจสอบว่าเจอ user หรือไม่

        const insertQuery = `
            INSERT INTO bills (user_id, room_id, billing_cycle, rent, water, electricity, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        // เพิ่มข้อมูลที่ใช้ในการ insert
        console.log("📝 Inserting bill with:", {
            user_id: user.owner_id,
            room_id: roomNumber,
            billing_cycle: billingCycle,
            rentAmount,
            waterAmount,
            electricityAmount,
            billStatus
        });

        // ตรวจสอบค่าก่อน insert
        console.log("📝 Values to be inserted into the bills table:", [
            user.owner_id,  // user_id ที่ดึงมา
            roomNumber,
            billingCycle,
            rentAmount,
            waterAmount,
            electricityAmount,
            billStatus
        ]);

        db.run(insertQuery, [
            user.owner_id, 
            roomNumber,
            billingCycle,
            rentAmount,
            waterAmount,
            electricityAmount,
            billStatus
        ], (err) => {
            if (err) {
                console.error("❌ SQL Insert Error:", err.code, err.message);
                return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูล", error: err.message });
            }

            console.log("✅ Inserted bill successfully!");
            res.json({ message: "เพิ่มบิลสำเร็จ!" });
        });
    });
});

module.exports = router;