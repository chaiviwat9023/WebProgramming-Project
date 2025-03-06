const express = require("express");
const router = express.Router();
const db = require("../config/database");
const bcrypt = require("bcrypt");

// แสดงหน้า Login
router.get("/", (req, res) => {
    res.render("login");
});

router.post("/", (req, res) => {
    const { action, username, fname, lname, email, phone, password, confirmPassword, role } = req.body;

    // ✅ การเข้าสู่ระบบ
    if (action === "login") {
        db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
            }

            if (!user) {
                return res.status(400).json({ success: false, message: "ชื่อผู้ใช้ไม่ถูกต้อง" });
            }

            // ตรวจสอบรหัสผ่าน
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err || !isMatch) {
                    return res.status(400).json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" });
                }

                res.json({ success: true, message: "เข้าสู่ระบบสำเร็จ" });
            });
        });
    }

    // ✅ การลงทะเบียน
    else if (action === "register") {
        db.get("SELECT * FROM users WHERE username = ?", [username], (err, existingUser) => {
            if (err) {
                return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
            }

            if (existingUser) {
                return res.status(400).json({ success: false, message: "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว" });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({ success: false, message: "รหัสผ่านไม่ตรงกัน" });
            }

            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการเข้ารหัสรหัสผ่าน" });
                }

                const status = role || "tenant";

                db.run(
                    "INSERT INTO users (username, first_name, last_name, email, phone_number, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [username, fname, lname, email, phone, hashedPassword, status],
                    function (err) {
                        if (err) {
                            return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
                        }

                        res.json({ success: true, message: "ลงทะเบียนสำเร็จ" });
                    }
                );
            });
        });
    }
});

module.exports = router;