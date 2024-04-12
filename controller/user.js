const nodemailer = require('nodemailer');
const User = require('../models/user');
const emailVerification = require('../models/emailVerfication');
const {isValidObjectId} = require("mongoose");

exports.create = async (req, res) => {
    const {name, email, role, password} = req.body;
    const oldUser = await User.findOne({email: email});
    if (oldUser) {
        return res.status(500).json({error: 'User already exists'});
    }
    const newUser = await User({
        name,
        email,
        role,
        password
    });
    await newUser.save();
    // generate 6 digit otp
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += Math.round(Math.random() * 9);
    }
    // Store otp in database
    const newEmailVerification = new emailVerification({
        owner: newUser._id,
        token: OTP,
    });
    await newEmailVerification.save();

    // Send email to user
    var transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "27f98c59f58f7f",
            pass: "8b0d6ae6f13275"
        }
    });
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
    if (!user) return res.json({error: 'User not found'});
    if (user.isVerified) return res.json({error: 'User already verified'});
    const token = await emailVerification.findOne({owner: userID});
    if (!token) return res.json({error: 'Token not found'});
    const isMatched = await token.compareToken(OTP)
    if (!isMatched) return res.json({error: 'Invalid OTP'});
    user.isVerified = true;
    await user.save();
    await emailVerification.findByIdAndDelete(token._id);
    // Send email to user
    var transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "27f98c59f58f7f",
            pass: "8b0d6ae6f13275"
        }
    });
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
    const { userID } = req.body;

    const user = await User.findById(userID);
    if (!user) return res.json({ error: "user not found!" });

    if (user.isVerified)
        return res.json({ error: "This email id is already verified!" });

    const alreadyHasToken = await emailVerification.findOne({
        owner: userID,
    });
    if (alreadyHasToken)
        return res.json({ error: "Only after one hour you can request for another token!" });

    // generate 6 digit otp
    let OTP = "";
    for (let i = 1; i <= 5; i++) {
        const randomVal = Math.round(Math.random() * 9);
        OTP += randomVal;
    }

    // store otp inside our db
    const newEmailVerificationToken = new emailVerification({ owner: user._id, token: OTP })

    await newEmailVerificationToken.save()

    // Send email to user
    var transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "27f98c59f58f7f",
            pass: "8b0d6ae6f13275"
        }
    });
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
}