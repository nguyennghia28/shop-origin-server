const router = require('express').Router();

const { verifyTokenAndAdmin } = require('../middleware/verifyToken');

const Collection = require('../models/collectionModel');
const Product = require('../models/productModel');

// GET PRODUCT BY CATEGORY
router.get('/', async (req, res) => {
    try {
        const prod = await Collection.find({
            name: req.query.collectionName ? req.query.collectionName : undefined,
            isDelete: false,
        }).exec();
        var prodCategory = [];
        var query = {
            type: req.query.type ? req.query.type : undefined,
            sex: req.query.sex ? req.query.sex : undefined,
            name: req.query.name ? req.query.name : undefined,
            brand: req.query.brand ? req.query.brand : undefined,
            stock: req.query.stock === '1' ? { $gt: 0 } : req.query.stock === '2' ? 0 : undefined,
            finalPrice:
                req.query.minValue && req.query.maxValue
                    ? {
                          $gte: req.query.minValue,
                          $lt: req.query.maxValue,
                      }
                    : undefined,
        };
        for (let i = 0; i < prod.length; i++) {
            let element = prod[i];
            const product = await Product.find({ ...query });
            let productByCate = product.filter(item => item.collectionObj._id.toString() === element._id.toString());
            if (productByCate.length > 0) {
                element = { ...element._doc, products: productByCate };
                prodCategory.push(element);
            }
        }
        res.status(200).json({ data: { prodCategory }, message: 'success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

//GET ALL COLLECTIONS
router.get('/allCols/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const collections = await Collection.find();

        res.status(200).json({ data: { collections: collections }, message: 'success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

//GET COLLECTIONS UNDELETED
router.get('/undeleted/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const collections_undeleted = await Collection.find({ isDelete: false }).sort({createdAt: -1}).exec();

        res.status(200).json({
            data: { collections_undeleted: collections_undeleted },
            message: 'success',
            status: 200,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error, status: 500 });
    }
});

//GET COLLECTIONS DELETED
router.get('/deleted/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const collections_deleted = await Collection.find({ isDelete: true }).sort({createdAt: -1}).exec();

        res.status(200).json({ data: { collections_deleted: collections_deleted }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error, status: 500 });
    }
});

//POST COLLECTION
router.post('/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const newCollection = new Collection(req.body);

        const savedProduct = await newCollection.save();

        res.status(200).json({ data: { collection: savedProduct }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// DELETE COLLECTION
router.delete('/delete/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        await Collection.findByIdAndUpdate(
            req.params.id,
            {
                isDelete: true,
            },
            { new: true }
        );

        res.status(200).json({ data: {}, message: 'Delete collection success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// GET COLLECTION BY ID
router.get('/detail/:id', async (req, res) => {
    try {
        const collection = await Collection.findOne({ _id: req.params.id }).exec();

        res.status(200).json({ data: { detailCollection: collection }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// DELETE COLLECTION
router.put('/delete/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const updateCollection = await Collection.findByIdAndUpdate(
            req.params.id,
            {
                isDelete: true,
            },
            { new: true }
        );

        res.status(200).json({ data: {}, message: ' Delete collection success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// DELETE COLLECTION
router.put('/restore/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const updateCollection = await Collection.findByIdAndUpdate(
            req.params.id,
            {
                isDelete: false,
            },
            { new: true }
        );

        res.status(200).json({ data: {}, message: ' Restore collection success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// UPDATE
router.put('/update/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const updateCollection = await Collection.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );

        res.status(200).json({ data: { collection: updateCollection }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.messagerror, status: 500 });
    }
});

module.exports = router;
