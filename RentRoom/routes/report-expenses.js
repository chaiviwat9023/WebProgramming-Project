const express = require("express");
const router = express.Router();

// ดึงข้อมูลบิล
router.get("/", (req, res) => {
    res.send("ดึงรายการแจ้งค่าใช้จ่าย");
});

// เพิ่มบิลใหม่
router.post("/", (req, res) => {
    res.send("สร้างแจ้งค่าใช้จ่ายใหม่");
});

module.exports = router;
