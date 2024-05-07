const nodemailer = require("nodemailer");
exports.generateOTP =(otp_length=6) =>{
    // generate 6 digit otp
    let OTP = "";
    for (let i = 1; i <= otp_length; i++) {
        const randomVal = Math.round(Math.random() * 9);
        OTP += randomVal;
    }
    return OTP;
}
exports.generateMailTransporter = () => {
    nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "27f98c59f58f7f",
            pass: "8b0d6ae6f13275"
        }
    });
}