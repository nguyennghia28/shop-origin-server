const router = require('express').Router();
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const Rank = require('../models/rankModel');
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyTokenAndAdminOnly } = require('../middleware/verifyToken');
const OTP = require('../models/otpModel');

const dotenv = require('dotenv');

dotenv.config();

router.get('/userInfo', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('rank');
        const { password, ...other } = user._doc;
        res.status(200).json({ data: { ...other }, message: 'Success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// UPDATE
router.put('/:id', verifyTokenAndAuthorization, async (req, res) => {
    if (req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SECRET).toString();
    }
    try {
        const updateUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );
        res.status(200).json({ data: { updateUser }, message: 'Success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// DELETE
router.delete('delete:/id', verifyTokenAndAdmin, async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.params.id,
            {
                isDelete: true,
            },
            {
                new: true,
            }
        );
        res.status(200).json({ data: {}, message: 'User has been deleted...', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// GET USER
router.get('/find/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('rank');
        const { password, ...other } = user._doc;
        res.status(200).json({ data: { ...other }, message: 'Success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// GET USER
// router.get('/findall/:id', verifyTokenAndAdmin, async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         // const { password, ...other } = user._doc;
//         res.status(200).json({ data: { user }, message: 'Success', status: 200 });
//     } catch (error) {
//         res.status(500).json({ data: {}, message: error.message, status: 500 });
//     }
// });

router.get('/', verifyTokenAndAdmin, async (req, res) => {
    const query = req.query.new;
    try {
        const users = await User.find()
            .sort({ _id: -1 })
            .limit(query == 'true' ? 10 : 0);
        res.status(200).json({ data: { ...users }, message: 'Success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

//GET USERS ROLE USER
router.get('/users/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).populate('rank');
        res.status(200).json({ data: { users: users }, message: 'success', status: 200 });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

//GET USERS ROLE STAFF
router.get('/staffs/', verifyTokenAndAdminOnly, async (req, res) => {
    try {
        const users = await User.find({ role: 'staff' }).sort({createdAt: -1});
        res.status(200).json({ data: { users: users }, message: 'success', status: 200 });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// DELETE USER
router.put('/delete/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.params.id,
            {
                isDelete: true,
            },
            { new: true }
        );

        res.status(200).json({ data: {}, message: ' Delete user success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// RESTORE USER
router.put('/restore/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.params.id,
            {
                isDelete: false,
            },
            { new: true }
        );

        res.status(200).json({ data: {}, message: 'Restore user success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// ADD ACCOUNT STAFF
// ADMIN
router.post('/addStaff', verifyTokenAndAdminOnly, async (req, res) => {
    try {
        const rank = await Rank.findOne({ nameen: 'Unrank' }).exec();
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            phone: req.body.phone,
            sex: req.body.sex,
            password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SECRET).toString(),
            rank,
            role: 'staff',
            isDelete: false,
            verified: true,
        });

        const user = await newUser.save();
        const accessToken = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '3d' }
        );

        res.status(200).json({ data: { token: accessToken }, message: 'success', status: 200 });
    } catch (err) {
        console.log(err);
        res.status(500).json({ data: {}, message: err, status: 500 });
    }
});

// UPDATE
router.put('/update/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const updateStaff = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );

        res.status(200).json({ data: { updateStaff: updateStaff }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.messagerror, status: 500 });
    }
});

// UPDATE
router.put('/resetpassword/:id', verifyTokenAndAdminOnly, async (req, res) => {
    try {
        const resetPassword = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: { password: CryptoJS.AES.encrypt('12345678', process.env.PASS_SECRET).toString() },
            },
            { new: true }
        );

        res.status(200).json({ data: { resetPassword: resetPassword }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.messagerror, status: 500 });
    }
});

//GET USER STATS
router.get('/stats', verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {
        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear }, role: 'user' } },
            {
                $project: {
                    month: { $month: '$createdAt' },
                },
            },
            {
                $group: {
                    _id: '$month',
                    total: { $sum: 1 },
                },
            },
        ]);
        res.status(200).json({ data: { data: data }, message: 'success', status: 200 });
    } catch (err) {
        res.status(500).json({ data: {}, message: error.messagerror, status: 500 });
    }
});

module.exports = router;
