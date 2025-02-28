const express = require("express");
const app = express();
const path = require("path");

// ตั้งค่าให้ใช้ EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ตั้งค่า Static Files เช่น CSS, รูปภาพ
app.use(express.static("public"));

// เส้นทางสำหรับแต่ละหน้า
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/choose", (req, res) => {
    res.render("choose");
});

app.get("/rent", (req, res) => {
    res.render("rent");
});

app.get("/payment", (req, res) => {
    res.render("payment");
});

app.get("/history", (req, res) => {
    res.render("history");
});

app.get("/logout", (req, res) => {
    res.send("Logging out...");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/management", (req, res) => {
    res.render("management");
});

// เปิดเซิร์ฟเวอร์
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
