const router = require('express').Router();
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/userModel');
const OTP = require('../models/otpModel');
const Rank = require('../models/rankModel');
const SendMailUtil = require('../utils/sendEmail');

router.post('/verifyOTP', async (req, res) => {
    try {
        let { userId, otp } = req.body;
        if (!userId || !otp) {
            res.status(500).send({ message: 'Chua co' });
        } else {
            const userOTP = await OTP.findOne({
                userId: userId,
            }).exec();
            if (!userOTP) {
                res.status(500).send({ message: 'Khong tim thay OTP' });
            } else {
                if (userOTP.expires < Date.now()) {
                    // het han OTP
                    await userOTP.remove();
                } else {
                    const originalOTP = CryptoJS.AES.decrypt(userOTP.OTP, process.env.PASS_SECRET).toString(
                        CryptoJS.enc.Utf8
                    );
                    if (originalOTP !== otp) {
                        res.status(500).send({ data: {}, message: 'Internal Server Error', status: 500 });
                    } else {
                        await userOTP.remove();
                        const user = await User.findById(userId).exec();
                        await User.findByIdAndUpdate(userId, { verified: true });
                        const accessToken = jwt.sign(
                            {
                                id: user._id,
                                role: user.role,
                            },
                            process.env.JWT_SECRET,
                            { expiresIn: '3d' }
                        );
                        res.status(200).send({
                            data: { token: accessToken },
                            message: 'Email verified successfully',
                            status: 200,
                        });
                    }
                }
            }
        }
    } catch (error) {
        res.status(500).send({ data: {}, message: 'Internal Server Error', status: 500 });
    }
});

//REGISTER
router.post('/register', async (req, res) => {
    try {
        const existsEmail = await User.find({ email: req.body.email }).exec();
        if (existsEmail.length > 0) {
            res.status(404).json({ data: {}, message: 'existEmail', status: 404 });
        } else {
            const rank = await Rank.findOne({ nameen: 'Unrank' }).exec();
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SECRET).toString(),
                rank,
                facebookId: '',
            });
            const user = await newUser.save();
            await SendMailUtil.verifyOTP(user._id, user.email, 'Verify Email');
            res.status(200).json({ data: { userId: user._id }, message: 'Please verify email', status: 200 });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ data: {}, message: err, status: 500 });
    }
});

//LOGIN
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            res.status(404).json({
                data: {},
                message: req.body.language === 'vi' ? 'Không tìm thấy tài khoản' : 'User not found!',
                status: 404,
            });
        } else if (user.isDelete) {
            res.status(406).json({
                data: {},
                message:
                    req.body.language === 'vi' ? 'Tài khoản của bạn bị hạn chế' : 'Your account is restricted mode',
                status: 406,
            });
        } else {
            const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SECRET);
            const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
            const inputPassword = req.body.password;
            if (originalPassword != inputPassword) {
                res.status(500).json({
                    data: {},
                    message:
                        req.body.language === 'vi'
                            ? 'Tài khoản hoặc mật khẩu không đúng'
                            : 'Incorrect account or password',
                    status: 500,
                });
            } else {
                if (!user.verified) {
                    let token = await OTP.findOne({ userId: user._id });
                    if (!token) {
                        await SendMailUtil.verifyOTP(user._id, user.email, 'Verify Email');
                    }
                    return res.status(200).send({
                        data: { userId: user._id },
                        message:
                            req.body.language === 'vi'
                                ? 'Một Email gửi đến tài khoản của bạn xin vui lòng xác minh'
                                : 'An Email sent to your account please verify',
                        status: 210,
                    });
                } else {
                    const accessToken = jwt.sign(
                        {
                            id: user._id,
                            role: user.role,
                        },
                        process.env.JWT_SECRET,
                        { expiresIn: '3d' }
                    );
                    res.status(200).json({ data: { token: accessToken }, message: 'success', status: 200 });
                }
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ data: {}, message: err, status: 500 });
    }
});

//FACEBOOK LOGIN
router.post('/loginFacebook', async (req, res) => {
    const { facebookId, email, name } = req.body;
    try {
        const user = await User.findOne({ facebookId });
        const rank = await Rank.findOne({ nameen: 'Unrank' }).exec();
        if (user) {
            if (user.isDelete) {
                res.status(406).json({
                    data: {},
                    message:
                        req.body.language === 'vi' ? 'Tài khoản của bạn bị hạn chế' : 'Your account is restricted mode',
                    status: 406,
                });
            } else {
                const accessToken = await jwt.sign(
                    {
                        id: user._id,
                        role: user.role,
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '3d' }
                );
                res.status(200).json({ data: { token: accessToken }, message: 'success', status: 200 });
            }
        } else {
            const newUser = await User.create({
                username: name,
                email,
                facebookId,
                rank,
            });
            const accessToken = await jwt.sign(
                {
                    id: newUser._id,
                    role: newUser.role,
                },
                process.env.JWT_SECRET,
                { expiresIn: '3d' }
            );
            res.status(200).json({ data: { token: accessToken }, message: 'success', status: 200 });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ data: {}, message: err, status: 500 });
    }
});

//FORGOT PASSWORD
router.post('/forgotPassword', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            res.status(500).json({ data: {}, message: 'khong ton tai user', status: 500 });
        } else {
            const forgotPassword = true;
            await SendMailUtil.verifyOTP(user._id, user.email, 'Verify Email Forgot Password', forgotPassword);
            res.status(200).json({ data: { userId: user._id }, message: 'Please verify email', status: 200 });
        }
    } catch (err) {
        res.status(500).json({ data: {}, message: err, status: 500 });
    }
});

// VERIFY FORGOTPASSWORD
router.post('/verifyForgotPassword', async (req, res) => {
    try {
        let { userId, otp } = req.body;
        if (!userId || !otp) {
            res.status(500).send({ message: 'Chua co' });
        } else {
            const userOTP = await OTP.findOne({
                userId: userId,
            }).exec();
            if (!userOTP) {
                res.status(500).send({ message: 'Ina' });
            } else {
                if (userOTP.expires < Date.now()) {
                    // het han OTP
                    await userOTP.remove();
                } else {
                    const originalOTP = CryptoJS.AES.decrypt(userOTP.OTP, process.env.PASS_SECRET).toString(
                        CryptoJS.enc.Utf8
                    );
                    if (originalOTP !== otp) {
                        res.status(500).send({ data: {}, message: 'Internal Server Error', status: 500 });
                    } else {
                        await userOTP.remove();
                        await User.findByIdAndUpdate(
                            userId,
                            {
                                $set: {
                                    password: CryptoJS.AES.encrypt(
                                        req.body.password,
                                        process.env.PASS_SECRET
                                    ).toString(),
                                },
                            },
                            { new: true }
                        );
                        res.status(200).send({
                            data: {},
                            message: 'Email verified successfully',
                            status: 200,
                        });
                    }
                }
            }
        }
    } catch (error) {
        res.status(500).send({ data: {}, message: 'Internal Server Error', status: 500 });
    }
});

//CHANGE PASSWORD
router.put('/changepassword/:id', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });

        const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SECRET);

        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

        const inputPassword = req.body.password;

        if (originalPassword != inputPassword) {
            res.status(403).json({
                data: {},
                message: req.body.lang === 'vi' ? 'Mật khẩu cũ không chính xác' : 'Old password is incorrect',
                status: 500,
            });
        } else {
            const changePassword = await User.findByIdAndUpdate(
                req.params.id,
                {
                    $set: { password: CryptoJS.AES.encrypt(req.body.newPassword, process.env.PASS_SECRET).toString() },
                },
                { new: true }
            );

            res.status(200).json({ data: { changePassword: changePassword }, message: 'success', status: 200 });
        }
    } catch (err) {
        res.status(500).json({ data: {}, message: err, status: 500 });
    }
});

module.exports = router;
