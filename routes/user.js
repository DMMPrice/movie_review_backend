const express = require('express');
const {create, verifyEmail, resendEmailVerificationToken} = require('../controller/user');
const {userValidator, validate} = require("../middlewares/validator");

const router = express.Router();

router.post('/', userValidator, validate, create);
router.post('/verify-email', verifyEmail);
router.post('/resend-email-verification-token', resendEmailVerificationToken);

module.exports = router;