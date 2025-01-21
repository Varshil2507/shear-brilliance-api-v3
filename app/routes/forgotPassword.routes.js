const express = require('express');
const router = express.Router();
const { sendResetEmail } = require('./forgotPasswordController');

router.post('/forgot-password', sendResetEmail);

module.exports = router;