const express = require("express");
const app = express();
const path = require("path");

const session = require("express-session");
const cookieParser = require("cookie-parser");

// ใช้ cookie-parser ก่อน express-session
app.use(cookieParser());

// ใช้ express-session เพื่อเก็บ session
app.use(
  session({
    secret: "your-secret-key", // คีย์สำหรับการเข้ารหัส session
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 }, // Cookie มีอายุ 1 ชั่วโมง
  })
);

// ส่ง session ไปยังทุกๆ view
app.use((req, res, next) => {
  res.locals.session = req.session; // ส่ง session ให้ทุก view สามารถใช้งานได้
  next();
});

// Middleware ที่ตรวจสอบว่าผู้ใช้ล็อกอินหรือยัง
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next(); // ผู้ใช้ล็อกอินแล้ว ไปยัง route ต่อไป
  } else {
    return res.redirect("/login"); // ถ้าไม่ได้ล็อกอินให้ไปหน้า login
  }
};

// เปลี่ยนให้ /login ไม่ต้องใช้ isAuthenticated เพราะผู้ใช้ยังไม่ล็อกอิน
app.get("/login", (req, res) => {
  if (req.session.user) {
    // ถ้า user ล็อกอินแล้ว ให้ redirect ไปที่หน้า home
    return res.redirect("/home");
  }
  res.render("login"); // ถ้าไม่ล็อกอิน ให้แสดงหน้า login
});

app.get("/logout", (req, res) => {
  // Destroy the session and redirect to the login page
  req.session.destroy(() => {
    res.clearCookie("sessionId");
    res.redirect("/choose");
  });
});

// ตั้งค่า middleware สำหรับอ่าน JSON
app.use(express.json());

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
app.use("/", chooseRoutes);
app.use("/choose", chooseRoutes);
app.use("/home", isAuthenticated, homeRoutes);
app.use("/rent", isAuthenticated, rentRoutes);
app.use("/payment", isAuthenticated, paymentRoutes);
app.use("/history", isAuthenticated, historyRoutes);
app.use("/login", loginRoutes);
app.use("/management", isAuthenticated, managementRoutes);
app.use("/notify", isAuthenticated, notifyRoutes);

// Management import routes
const editRoomRoutes = require("./routes/edit-room");
const reportExpenseRoutes = require("./routes/report-expenses");
const reportBillRoutes = require("./routes/approve-bill");
const reportBookingRoutes = require("./routes/approve-booking");

// Management ใช้งาน routes
app.use("/edit-room", isAuthenticated, editRoomRoutes);
app.use("/report-expenses", isAuthenticated, reportExpenseRoutes);
app.use("/approve-bill", isAuthenticated, reportBillRoutes);
app.use("/approve-booking", isAuthenticated, reportBookingRoutes);

// เปิดเซิร์ฟเวอร์
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});