const express = require("express");
const router = express.Router();
const db = require("../config/database"); // นำเข้า database.js

// ดึงข้อมูลบิลทั้งหมด
router.get('/', (req, res) => {
    const sql = `
        SELECT 
            bill_id, 
            billing_cycle, 
            rent, 
            water, 
            electricity, 
            (rent + water + electricity) AS total_amount, 
            status 
        FROM bills;
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.render('payment', { data: rows });
    });
});

module.exports = router;