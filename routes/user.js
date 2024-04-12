const express = require('express');
const {create, verifyEmail, resendEmailVerification} = require('../controller/user');
const {userValidator, validate} = require("../middlewares/validator");

const router = express.Router();

router.post('/', userValidator, validate, create);
router.post('/verify-email', verifyEmail);
router.post('/resend-email-verification-token', resendEmailVerification);

module.exports = router;