const express = require("express");
const router = express.Router();
const db = require("../config/database"); // นำเข้า database.js

router.get('/', (req, res) => {
    const sql = `
        SELECT reservation_id, reservation_date, room_id, 
            CASE status 
                WHEN 'pending' THEN 'รอดำเนินการ' 
                WHEN 'approved' THEN 'อนุมัติ' 
                WHEN 'rejected' THEN 'ปฏิเสธ' 
                WHEN 'canceled' THEN 'ยกเลิก' 
            END AS status
        FROM reservations;
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.render('history', { data: rows });
    });
});

module.exports = router;