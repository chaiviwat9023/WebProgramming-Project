const express = require("express");
const app = express();
const path = require("path");

// ตั้งค่าให้ใช้ EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ตั้งค่า Static Files เช่น CSS, รูปภาพ
app.use(express.static("public"));

// Import routes
const homeRoutes = require("./routes/home");
const chooseRoutes = require("./routes/choose");
const rentRoutes = require("./routes/rent");
const paymentRoutes = require("./routes/payment");
const historyRoutes = require("./routes/history");
const loginRoutes = require("./routes/login");
const managementRoutes = require("./routes/management");
const notifyRoutes = require("./routes/notify");

// ใช้งาน routes
app.use("/", homeRoutes);
app.use("/choose", chooseRoutes);
app.use("/rent", rentRoutes);
app.use("/payment", paymentRoutes);
app.use("/history", historyRoutes);
app.use("/login", loginRoutes);
app.use("/management", managementRoutes);
app.use("/notify", notifyRoutes);

// เปิดเซิร์ฟเวอร์
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
