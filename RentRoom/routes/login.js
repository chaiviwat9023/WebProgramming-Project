const express = require("express");
const router = express.Router();
const db = require("../config/database");
const bcrypt = require("bcrypt");

// แสดงหน้า Login
router.get("/", (req, res) => {
  res.render("login");
});


router.get('/', (req, res) => {
    if (req.session.user) {
      res.json({ loggedIn: true });
    } else {
      res.json({ loggedIn: false });
    }
  });


// จัดการการ Login และ Register
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

  // 📌 **การเข้าสู่ระบบ (Login)**
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

        // ตรวจสอบรหัสผ่านที่เข้ารหัส
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err || !isMatch) {
            return res
              .status(400)
              .json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" });
          }

          // 🔹 **เก็บ Session**
          req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role,
          };

          // 🔹 **ตั้งค่า Cookie**
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

  // 📌 **การลงทะเบียน (Register)**
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

        // เข้ารหัสรหัสผ่านก่อนบันทึก
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            return res
              .status(500)
              .json({
                success: false,
                message: "เกิดข้อผิดพลาดในการเข้ารหัสรหัสผ่าน",
              });
          }

          const status = role || "tenant"; // ค่า role ถ้าไม่ได้กำหนด จะเป็น 'tenant' โดยอัตโนมัติ

          db.run(
            "INSERT INTO users (username, first_name, last_name, email, password, role, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [username, fname, lname, email, hashedPassword, status, phone],
            function (err) {
              if (err) {
                console.log(err); // เพิ่มการแสดงข้อผิดพลาดที่เกิดขึ้น
                return res
                  .status(500)
                  .json({
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
