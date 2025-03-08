const express = require("express");
const router = express.Router();
const db = require("../config/database");

// ดึงข้อมูลการชำระเงินโดยใช้ bill_id
router.get('/details/:bill_id', (req, res) => {
    const billId = req.params.bill_id;

    const sql = `
        SELECT transfer_date, transfer_time, slip_image 
        FROM payments 
        WHERE bill_id = ?;
    `;

    db.get(sql, [billId], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
        }

        if (!row) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลการชำระเงิน' });
        }

        res.json({ success: true, ...row });
    });
});

// อนุมัติการชำระเงิน
router.post('/approve/:bill_id', (req, res) => {
    const billId = req.params.bill_id;

    console.log('ได้รับคำขออนุมัติสำหรับ bill_id:', billId); // ตรวจสอบ bill_id

    // คำสั่ง SQL สำหรับอัปเดตสถานะบิลเป็น 'paid'
    const updateBillSql = `
        UPDATE bills 
        SET status = 'paid' 
        WHERE bill_id = ?;
    `;

    // คำสั่ง SQL สำหรับดึงข้อมูลผู้ใช้และ billing_cycle จากบิล
    const getBillSql = `
        SELECT user_id, billing_cycle 
        FROM bills 
        WHERE bill_id = ?;
    `;

    // คำสั่ง SQL สำหรับแทรกข้อมูลการแจ้งเตือน
    const insertNotificationSql = `
        INSERT INTO notifications (user_id, message, status)
        VALUES (?, ?, 'unread');
    `;

    db.serialize(() => {
        // ดึงข้อมูลผู้ใช้และ billing_cycle จากบิล
        db.get(getBillSql, [billId], (err, bill) => {
            if (err) {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลบิล:', err);
                return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบิล' });
            }

            if (!bill) {
                console.log('ไม่พบบิลที่ต้องการอนุมัติสำหรับ bill_id:', billId);
                return res.status(404).json({ success: false, message: 'ไม่พบบิลที่ต้องการอนุมัติ' });
            }

            const userId = bill.user_id;
            const billingCycle = bill.billing_cycle; // ดึง billing_cycle จากบิล

            // อัปเดตสถานะบิลเป็น 'paid'
            db.run(updateBillSql, [billId], function (err) {
                if (err) {
                    console.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ:', err);
                    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
                }

                if (this.changes === 0) {
                    console.log('ไม่พบบิลที่ต้องการอนุมัติสำหรับ bill_id:', billId);
                    return res.status(404).json({ success: false, message: 'ไม่พบบิลที่ต้องการอนุมัติ' });
                }

                console.log('อนุมัติการชำระเงินสำเร็จสำหรับ bill_id:', billId);

                // สร้างข้อความแจ้งเตือนพร้อม billing_cycle
                const notificationMessage = `บิลค่าเช่าสำหรับรอบบิล ${billingCycle} ได้รับการอนุมัติ`;

                // แทรกข้อมูลการแจ้งเตือน
                db.run(insertNotificationSql, [userId, notificationMessage], (err) => {
                    if (err) {
                        console.error('เกิดข้อผิดพลาดในการแทรกการแจ้งเตือน:', err);
                        return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการแจ้งเตือน' });
                    }

                    console.log('ส่งการแจ้งเตือนสำเร็จสำหรับ user_id:', userId);
                    res.json({ success: true, message: 'อนุมัติการชำระเงินและส่งแจ้งเตือนสำเร็จ' });
                });
            });
        });
    });
});

module.exports = router;