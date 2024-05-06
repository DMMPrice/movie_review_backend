const crypto = require('crypto');
const User = require('../models/user');
const emailVerification = require('../models/emailVerfication');
const passwordResetToken = require('../models/passwordResetToken');
const {isValidObjectId} = require("mongoose");
const {generateMailTransporter, generateOTP} = require("../utils/mail");
const {sendError, generateRandomByte} = require("../utils/helpers");

exports.create = async (req, res) => {
    const {name, email, role, password} = req.body;
    const oldUser = await User.findOne({email: email});
    if (oldUser) {
        return sendError(res, 'User already exists');
    }
    const newUser = await User({
        name,
        email,
        role,
        password
    });
    await newUser.save();
    // generate 6 digit otp
    let OTP = generateOTP();
    // Store otp in database
    const newEmailVerification = new emailVerification({
        owner: newUser._id,
        token: OTP,
    });
    await newEmailVerification.save();

    // Send email to user
    var transport = generateMailTransporter();
    await transport.sendMail(
        {
            from: 'ghoshaniruddha2003@gmail.com',
            to: newUser.email,
            subject: 'Email Verification',
            html: `
                    <p>Hi ${newUser.name}</p>
                    <h1>Your OTP is ${OTP}</h1>
                    
                    `
        })
    res.status(200).json({message: "Please verify your email address. OTP sent to your email address."});
}

exports.verifyEmail = async (req, res) => {
    const {userID, OTP} = req.body;
    if (!isValidObjectId(userID)) return res.json({error: 'Invalid user'});
    const user = await User.findById(userID);
    if (!user) return sendError(res, 'User not found',404);
    if (user.isVerified) return sendError(res, 'User already verified');
    const token = await emailVerification.findOne({owner: userID});
    if (!token) return sendError(res, 'Token not found');
    const isMatched = await token.compareToken(OTP)
    if (!isMatched) return sendError(res, 'Invalid OTP');
    user.isVerified = true;
    await user.save();
    await emailVerification.findByIdAndDelete(token._id);
    // Send email to user
    var transport = generateMailTransporter();
    await transport.sendMail(
        {
            from: 'ghoshaniruddha2003@gmail.com',
            to: user.email,
            subject: 'Welcome Email',
            html: "<h1>Welcome to our website</h1>"
        });
    res.json({message: 'User verified successfully'});
};
exports.resendEmailVerification = async (req, res) => {
    const {userID} = req.body;

    const user = await User.findById(userID);
    if (!user) return sendError(res, "user not found!");

    if (user.isVerified)
        return res.json({error: "This email id is already verified!"});

    const alreadyHasToken = await emailVerification.findOne({
        owner: userID,
    });
    if (alreadyHasToken)
        return sendError(res,"Only after one hour you can request for another token!");

    let OTP = generateOTP();

    // store otp inside our db
    const newEmailVerificationToken = new emailVerification({owner: user._id, token: OTP})

    await newEmailVerificationToken.save()

    // Send email to user
    var transport = generateMailTransporter()
    await transport.sendMail(
        {
            from: 'ghoshaniruddha2003@gmail.com',
            to: user.email,
            subject: 'Email Verification',
            html: `
                    <p>Hi ${newUser.name}</p>
                    <h1>Your OTP is ${OTP}</h1>
                    
                    `
        })
    res.json({
        message: "New OTP has been sent to your registered email account.",
    });
};

exports.forgetPassword = async (req,res)=>{
    const {email}=req.body;
    if (!email) return sendError(res,'email is missing!');
    const user = await User.findOne({email});
    if(!user) return sendError(res,'User not found',404);

    const alreadyHasToken = await passwordResetToken.findOne({
        owner: user._id,
    });
    if(alreadyHasToken)
        return sendError(res,"Only after one hour you can request for another token!");
    const token=await generateRandomByte();
    const newPasswordResetToken = await passwordResetToken({owner: user._id, token});
    await newPasswordResetToken.save();
    const resetPasswordUrl = `http://localhost:8000/api/user/reset-password/${token}&id=${user._id}`;
    var transport = generateMailTransporter();
    await transport.sendMail({
        from: 'ghoshaniruddha2003@gmail.com',
        to: user.email,
        subject: 'Email Verification',
        html: `
                    <p>Hi ${user.name}</p>
                    <h1>Reset your password by clicking <a href="${resetPasswordUrl}">here</a></h1>
                    
                    `,
    });

    res.json({message: 'Password reset link sent to your email address'});
}