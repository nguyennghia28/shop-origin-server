const router = require('express').Router();
const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');
const dotenv = require('dotenv');

const { verifyTokenAndAdmin } = require('../middleware/verifyToken');
const Product = require('../models/productModel');
const Collection = require('../models/collectionModel');
const HistoryPrice = require('../models/historyPriceModel');

dotenv.config();

const CLOUD_FRONT_URL = 'https://djr8hdvf9gux9.cloudfront.net/';

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESSKEY_ID,
    secretAccessKey: process.env.ACCESSKEY_SECRET,
});

const storage = multer.memoryStorage({
    destination(req, file, callback) {
        callback(null, '');
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 3000000 },
});

// POST
router.post('/', verifyTokenAndAdmin, upload.array('images', 10), async (req, res) => {
    // console.log(req.body,req.files);
    try {
        const images = req.files;
        if (typeof images !== 'undefined') {
            if (images.length > 0) {
                var images_url = [];
                for (let i = 0; i < images.length; i++) {
                    const image = images[i].mimetype;
                    const fileType = image.split('/')[1];
                    var filePath = `${uuid() + Date.now().toString()}.${fileType}`;
                    const uploadS3 = {
                        Bucket: 'mynh-bake-store',
                        Key: filePath,
                        Body: images[i].buffer,
                    };
                    try {
                        await s3.upload(uploadS3).promise();
                        images_url.push(`${CLOUD_FRONT_URL}${filePath}`);
                    } catch (error) {
                        return res.status(500).json({ data: {}, message: 'Lỗi S3', status: 500 });
                    }
                }
                const docCol = await Collection.findById(req.body.collectionId);
                const newProduct = new Product({
                    name: req.body.name,
                    brand: req.body.brand,
                    type: req.body.type,
                    sex: req.body.sex,
                    images: images_url,
                    collectionObj: docCol,
                    descriptionvi: req.body.descriptionvi,
                    descriptionen: req.body.descriptionen,
                    featuresvi: req.body.featuresvi,
                    featuresen: req.body.featuresen,
                    note: req.body.note ? req.body.note : '',
                    originalPrice: Number(req.body.originalPrice),
                    finalPrice: Number(req.body.originalPrice),
                    sold: 0,
                    stock: 0,
                    isDelete: req.body.isDelete,
                });
                await newProduct.save();
                res.status(200).json({ data: { product: newProduct }, message: 'success', status: 200 });
            }
        }
    } catch (error) {
        console.log('Loi', error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// UPDATE
router.put('/:id', verifyTokenAndAdmin, upload.array('images', 10), async (req, res) => {
    const images = req.files;
    if (images?.length > 0) {
        try {
            var images_url = [];
            for (let i = 0; i < images.length; i++) {
                const image = images[i].mimetype;
                const fileType = image.split('/')[1];
                var filePath = `${uuid() + Date.now().toString()}.${fileType}`;
                const uploadS3 = {
                    Bucket: 'mynh-bake-store',
                    Key: filePath,
                    Body: images[i].buffer,
                };
                try {
                    await s3.upload(uploadS3).promise();
                    images_url.push(`${CLOUD_FRONT_URL}${filePath}`);
                } catch (error) {
                    return res.status(500).json({ data: {}, message: 'Lỗi S3', status: 500 });
                }
            }
            const product = await Product.findById(req.params.id).exec();
            if (product.finalPrice !== Number(req.body.finalPrice)) {
                const historyPrice = {
                    product,
                    user: req.user.id,
                    oldPrice: product.finalPrice,
                    newPrice: Number(req.body.finalPrice),
                };
                await HistoryPrice.create(historyPrice);
            }
            const updateProduct = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    $set: { ...req.body, images: images_url },
                },
                { new: true }
            );

            res.status(200).json({ data: { product: updateProduct }, message: 'success', status: 200 });
        } catch (error) {
            console.log(error);
            res.status(500).json({ data: {}, message: error.message, status: 500 });
        }
    } else {
        try {
            const product = await Product.findById(req.params.id).exec();
            if (product.finalPrice !== Number(req.body.finalPrice)) {
                const historyPrice = {
                    product,
                    user: req.user.id,
                    oldPrice: product.finalPrice,
                    newPrice: Number(req.body.finalPrice),
                };
                await HistoryPrice.create(historyPrice);
            }
            const updateProduct = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    $set: { ...req.body },
                },
                { new: true }
            );

            res.status(200).json({ data: { product: updateProduct }, message: 'success', status: 200 });
        } catch (error) {
            console.log(error);
            res.status(500).json({ data: {}, message: error.message, status: 500 });
        }
    }
});

// GET PRODUCT BY LINK INSTAGRAM
router.get('/link', async (req, res) => {
    try {
        const products = await Product.find({ _id: { $in: req.query.id.split(',') } }).exec();
        res.status(200).json({ data: { products: products }, message: 'success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// GET ALL PRODUCT
router.get('/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const products = await Product.find().populate('collectionObj');
        res.status(200).json({ data: { products: products }, message: 'success', status: 200 });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

//GET PRODUCT UNDELETED
router.get('/undeleted/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const products_undeleted = await Product.find({ isDelete: false })
            .populate('collectionObj')
            .sort({ createdAt: -1 })
            .exec();

        res.status(200).json({ data: { products_undeleted: products_undeleted }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error, status: 500 });
    }
});

//GET PRODUCT DELETED
router.get('/deleted/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const products_deleted = await Product.find({ isDelete: true })
            .populate('collectionObj')
            .sort({ createdAt: -1 })
            .exec();

        res.status(200).json({ data: { products_deleted: products_deleted }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error, status: 500 });
    }
});

// GET PRODUCT HOME
router.get('/home', async (req, res) => {
    let product = [];
    try {
        let sellingProducts = await Product.find().sort('-sold').limit(4);
        let manProducts = await Product.find({ sex: { $in: ['m'] } });
        let womanProducts = await Product.find({ sex: { $in: ['w'] } });
        product.push(sellingProducts, manProducts, womanProducts);
        res.status(200).json({ data: { product: product }, message: 'success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// GET PRODUCT DETAIL
router.get('/detail/:slug/:amount', async (req, res) => {
    try {
        const detail = await Product.findById(req.params.slug).populate('collectionObj').exec();
        const related = await Product.find().populate('collectionObj').exec();

        const relatedProducts = related
            .filter(
                i =>
                    i.collectionObj._id.toString() === detail.collectionObj._id.toString() &&
                    i._id.toString() !== detail._id.toString()
            )
            .slice(0, req.params.amount);
        const detailProduct = {
            detail,
            relatedProducts,
        };
        res.status(200).json({ data: { detailProduct: detailProduct }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// GET PRODUCT BY ID
router.get('/detail/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id }).populate('collectionObj').exec();

        res.status(200).json({ data: { detailProduct: product }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// GET PRODUCT VIEWED
router.get('/viewed', async (req, res) => {
    try {
        const productViewed = await Product.find({ _id: { $in: [...req.query.id.split(',')] } });

        res.status(200).json({ data: { productViewed: productViewed }, message: 'success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// GET PRODUCT SEARCH
router.get('/search', async (req, res) => {
    try {
        const products = await Product.find({ $text: { $search: req.query.search } }).exec();
        res.status(200).json({ data: { products, total: products.length }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// DELETE PRODUCt
router.put('/delete/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        await Product.findByIdAndUpdate(
            req.params.id,
            {
                isDelete: true,
            },
            { new: true }
        );

        res.status(200).json({ data: {}, message: ' Delete product success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// RESTORE PRODUCt
router.put('/restore/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const updateProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                isDelete: false,
            },
            { new: true }
        );

        res.status(200).json({ data: {}, message: 'Restore product success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

module.exports = router;
