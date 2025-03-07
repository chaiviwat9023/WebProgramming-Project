const express = require("express");
const router = express.Router();
const db = require("../config/database");
const bcrypt = require("bcrypt");

// แสดงหน้า Login และตรวจสอบการล็อกอิน
router.get("/", (req, res) => {
  if (req.session.user && req.session.user.id) {
    return res.redirect("/home"); // Redirect ไปที่ /home เมื่อล็อกอินแล้ว
  }
  res.render("login"); // แสดงหน้า login เมื่อไม่ได้ล็อกอิน
});

// ตรวจสอบสถานะล็อกอิน (API)
router.get("/check-login", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

// จัดการการล็อกอินและการลงทะเบียน
router.post("/", (req, res) => {
  const {
    action,
    username,
    fname,
    lname,
    email,
    phone,
    password,
    confirmPassword,
    role,
  } = req.body;

  // การเข้าสู่ระบบ
  if (action === "login") {
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, user) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "เกิดข้อผิดพลาด" });
        }

        if (!user) {
          return res
            .status(400)
            .json({ success: false, message: "ชื่อผู้ใช้ไม่ถูกต้อง" });
        }

        // ตรวจสอบรหัสผ่าน
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err || !isMatch) {
            return res
              .status(400)
              .json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" });
          }

          // เก็บข้อมูลผู้ใช้ใน session
          req.session.user = {
            id: user.user_id, // ใช้ user.user_id แทน user.id
            username: user.username,
            role: user.role,
          };

          // ตั้งค่า cookie
          res.cookie("sessionId", req.sessionID, { httpOnly: true });

          res.json({
            success: true,
            message: "เข้าสู่ระบบสำเร็จ",
            user: req.session.user,
          });
        });
      }
    );
  }

  // การลงทะเบียน
  else if (action === "register") {
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, existingUser) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "เกิดข้อผิดพลาด" });
        }

        if (existingUser) {
          return res
            .status(400)
            .json({ success: false, message: "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว" });
        }

        if (password !== confirmPassword) {
          return res
            .status(400)
            .json({ success: false, message: "รหัสผ่านไม่ตรงกัน" });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "เกิดข้อผิดพลาดในการเข้ารหัสรหัสผ่าน",
            });
          }

          const status = role || "tenant";

          db.run(
            "INSERT INTO users (username, first_name, last_name, email, password, role, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [username, fname, lname, email, hashedPassword, status, phone],
            function (err) {
              if (err) {
                console.error("Error inserting user:", err); // Log ข้อผิดพลาด
                return res.status(500).json({
                  success: false,
                  message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
                });
              }

              res.json({ success: true, message: "ลงทะเบียนสำเร็จ" });
            }
          );
        });
      }
    );
  }
});

module.exports = router;
