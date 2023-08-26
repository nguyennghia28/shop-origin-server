const nodemailer = require('nodemailer');
const CryptoJS = require('crypto-js');
const dotenv = require('dotenv');
const OTP = require('../models/otpModel');

dotenv.config();

class SendMailUtil {
    static async verifyOTP(_id, email, subject, forgotPassword = undefined) {
        try {
            const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
            const transporter = nodemailer.createTransport({
                host: process.env.HOST,
                service: process.env.SERVICE,
                port: Number(process.env.EMAIL_PORT),
                secure: Boolean(process.env.SECURE),
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASS,
                },
            });
            await new OTP({
                userId: _id,
                OTP: CryptoJS.AES.encrypt(otp, process.env.PASS_SECRET).toString(),
            }).save();
            await transporter.sendMail({
                from: process.env.USER,
                to: email,
                subject: subject,
                html: forgotPassword
                    ? `<p>Enter <b>${otp}</b> in the app to verify forgot your passpword.</p>`
                    : `<p>Enter <b>${otp}</b> in the app to verify your account.</p>`,
            });
            console.log('email sent successfully');
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    static async sendMail(email, subject, content) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.HOST,
                service: process.env.SERVICE,
                port: Number(process.env.EMAIL_PORT),
                secure: Boolean(process.env.SECURE),
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASS,
                },
            });
            await transporter.sendMail({
                from: process.env.USER,
                to: email,
                subject: subject,
                html: content,
            });
            console.log('email sent successfully');
        } catch (error) {
            console.log(error);
            return error;
        }
    }
}

module.exports = SendMailUtil;
