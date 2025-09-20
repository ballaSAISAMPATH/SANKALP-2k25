const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, resendOTP,changePassword } = require('../controllers/otp-controller'); 

router.post('/send', sendOTP);

router.post('/verify', verifyOTP);

router.post('/resend', resendOTP);
router.post('/change-password',changePassword)

module.exports = router;