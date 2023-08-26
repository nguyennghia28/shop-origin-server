const router = require('express').Router();
const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

const CLOUD_FRONT_URL = 'https://djr8hdvf9gux9.cloudfront.net/';

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESSKEY_ID,
    secretAccessKey: process.env.ACCESSKEY_SECRET,
});

const { verifyTokenAndAdmin, verifyTokenAndAuthorization } = require('../middleware/verifyToken');

const Rank = require('../models/rankModel');
const Promotion = require('../models/promotionModel');

const storage = multer.memoryStorage({
    destination(req, file, callback) {
        callback(null, '');
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 3000000 },
});

router.post('/', verifyTokenAndAdmin, upload.single('icon'), async (req, res) => {
    try {
        var icon = '';
        const image = req.file.mimetype;
        const fileType = image.split('/')[1];
        var filePath = `${uuid() + Date.now().toString()}.${fileType}`;
        const uploadS3 = {
            Bucket: 'mynh-bake-store',
            Key: filePath,
            Body: req.file.buffer,
        };
        try {
            await s3.upload(uploadS3).promise();
            icon = `${CLOUD_FRONT_URL}${filePath}`;
        } catch (error) {
            return res.status(500).json({ data: {}, message: 'Lỗi S3', status: 500 });
        }

        const newRank = new Rank({
            icon,
            namevi: req.body.namevi,
            nameen: req.body.nameen,
            descriptionvi: req.body.descriptionvi,
            descriptionen: req.body.descriptionen,
            minValue: req.body.minValue,
            maxValue: req.body.maxValue,
        });

        const rank = await newRank.save();

        const newPromotion = new Promotion({
            titlevi: 'Voucher rank ' + rank.namevi.toLowerCase(),
            titleen: 'Voucher rank ' + rank.nameen.toLowerCase(),
            type: 'special',
            forRank: rank._id,
            code: 'voucher' + rank.nameen.toLowerCase(),
            value: 10,
            startDate: new Date('2000-01-01T14:51:19.447+00:00'),
            endDate: new Date('3000-04-30T14:51:19.447+00:00'),
            users: [],
            isDelete: false,
        });
        await newPromotion.save();

        res.status(200).json({ data: { rank }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// UPDATE
router.put('/:id', upload.single('icon'), verifyTokenAndAdmin, async (req, res) => {
    const image = req.file;
    if (image !== undefined) {
        var icon = '';
        const image = req.file.mimetype;
        const fileType = image.split('/')[1];
        var filePath = `${uuid() + Date.now().toString()}.${fileType}`;
        const uploadS3 = {
            Bucket: 'mynh-bake-store',
            Key: filePath,
            Body: req.file.buffer,
        };
        try {
            await s3.upload(uploadS3).promise();
            icon = `${CLOUD_FRONT_URL}${filePath}`;
        } catch (error) {
            return res.status(500).json({ data: {}, message: 'Lỗi S3', status: 500 });
        }
        try {
            const rank = await Rank.findByIdAndUpdate(
                req.params.id,
                {
                    $set: { ...req.body, icon: icon },
                },
                { new: true, omitUndefined: true }
            );

            res.status(200).json({ data: { rank }, message: 'success', status: 200 });
        } catch (error) {
            console.log(error);
            res.status(500).json({ data: {}, message: error.message, status: 500 });
        }
    } else {
        try {
            const rank = await Rank.findByIdAndUpdate(
                req.params.id,
                {
                    $set: req.body,
                },
                { new: true, omitUndefined: true }
            );

            res.status(200).json({ data: { rank }, message: 'success', status: 200 });
        } catch (error) {
            console.log(error);
            res.status(500).json({ data: {}, message: error.message, status: 500 });
        }
    }
});

// DELETE
router.put('/delete/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        await Rank.findByIdAndUpdate(
            req.params.id,
            {
                isDelete: true,
            },
            { new: true }
        );

        res.status(200).json({ data: {}, message: 'Delete promotion success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// RESTORE
router.put('/restore/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        await Rank.findByIdAndUpdate(
            req.params.id,
            {
                isDelete: false,
            },
            { new: true }
        );

        res.status(200).json({ data: {}, message: 'Restore promotion success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

//GET ALL PROMOTION
router.get('/', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const rank = await Rank.find().sort({ minValue: 1 });

        res.status(200).json({ data: { rank }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// GET PROMOTION BY ID
router.get('/detail/:id', async (req, res) => {
    try {
        const rank = await Rank.findOne({ _id: req.params.id }).exec();

        res.status(200).json({ data: { detailRank: rank }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

//GET PROMOTIONS UNDELETED
router.get('/undeleted/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const ranks_undeleted = await Rank.find({ isDelete: false, nameen: { $ne: 'Unrank' } }).sort({ minValue: 1 }).exec();

        res.status(200).json({ data: { ranks_undeleted: ranks_undeleted }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error, status: 500 });
    }
});

//GET PROMOTIONS DELETED
router.get('/deleted/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const ranks_deleted = await Rank.find({ isDelete: true }).sort({ minValue: 1 }).exec();

        res.status(200).json({ data: { ranks_deleted: ranks_deleted }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error, status: 500 });
    }
});

module.exports = router;
