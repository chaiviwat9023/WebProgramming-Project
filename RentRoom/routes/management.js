const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("management");
});

// Import API ย่อย
const editRoomRoutes = require("./edit-room");
const reportExpenseRoutes = require("./report-expenses");
const reportBillRoutes = require("./approve-bill");
const reportBookingRoutes = require("./approve-booking");

// ใช้งาน API ที่เกี่ยวข้อง
router.use("/edit-room", editRoomRoutes);
router.use("/report-expenses", reportExpenseRoutes);
router.use("/approve-bill", reportBillRoutes);
router.use("/approve-booking", reportBookingRoutes);

module.exports = router;