const router = require('express').Router();
const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');
const Post = require('../models/postModel');
const dotenv = require('dotenv');

dotenv.config();

const CLOUD_FRONT_URL = 'https://djr8hdvf9gux9.cloudfront.net/';

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESSKEY_ID,
    secretAccessKey: process.env.ACCESSKEY_SECRET,
});

const { verifyTokenAndAdmin } = require('../middleware/verifyToken');

const storage = multer.memoryStorage({
    destination(req, file, callback) {
        callback(null, '');
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 3000000 },
});

router.post('/', verifyTokenAndAdmin, upload.single('image'), async (req, res) => {
    try {
        var image = '';
        const imageUpload = req.file.mimetype;
        const fileType = imageUpload.split('/')[1];
        var filePath = `${uuid() + Date.now().toString()}.${fileType}`;
        const uploadS3 = {
            Bucket: 'mynh-bake-store',
            Key: filePath,
            Body: req.file.buffer,
        };
        try {
            await s3.upload(uploadS3).promise();
            image = `${CLOUD_FRONT_URL}${filePath}`;
        } catch (error) {
            return res.status(500).json({ data: {}, message: 'Lỗi S3', status: 500 });
        }
        const newPost = new Post({
            image,
            title: req.body.title,
            content: req.body.content,
            description: req.body.description,
        });

        const post = await newPost.save();

        res.status(200).json({ data: { post }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// UPDATE
router.put('/:id', upload.single('image'), verifyTokenAndAdmin, async (req, res) => {
    const img = req.file;
    if (img !== undefined) {
        var image = '';
        const imageUpload = req.file.mimetype;
        const fileType = imageUpload.split('/')[1];
        var filePath = `${uuid() + Date.now().toString()}.${fileType}`;
        const uploadS3 = {
            Bucket: 'mynh-bake-store',
            Key: filePath,
            Body: req.file.buffer,
        };
        try {
            await s3.upload(uploadS3).promise();
            image = `${CLOUD_FRONT_URL}${filePath}`;
        } catch (error) {
            return res.status(500).json({ data: {}, message: 'Lỗi S3', status: 500 });
        }
        try {
            const post = await Post.findByIdAndUpdate(
                req.params.id,
                {
                    $set: { ...req.body, image: image },
                },
                { new: true, omitUndefined: true }
            );

            res.status(200).json({ data: { post }, message: 'success', status: 200 });
        } catch (error) {
            console.log(error);
            res.status(500).json({ data: {}, message: error.message, status: 500 });
        }
    } else {
        try {
            const post = await Post.findByIdAndUpdate(
                req.params.id,
                {
                    $set: req.body,
                },
                { new: true, omitUndefined: true }
            );

            res.status(200).json({ data: { post }, message: 'success', status: 200 });
        } catch (error) {
            console.log(error);
            res.status(500).json({ data: {}, message: error.message, status: 500 });
        }
    }
});

// DELETE
router.delete('/delete/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        await Post.findByIdAndDelete(
            req.params.id,
        );

        res.status(200).json({ data: {}, message: 'Delete post success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

//GET ALL POST
router.get('/', async (req, res) => {
    try {
        const post = await Post.find().sort({createdAt: -1});

        res.status(200).json({ data: { post: post }, message: 'success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// GET PROMOTION BY ID
router.get('/detail/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).exec();

        res.status(200).json({ data: { detailPost: post }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

module.exports = router;
