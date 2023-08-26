const router = require('express').Router();
const Depot = require('../models/depotModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const DepotDetail = require('../models/depotDetailModel');

const { verifyTokenAndAdmin } = require('../middleware/verifyToken');

router.post('/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const products = req.body.products;

        const depotDetails = products.map(p => ({
            product: p.productId,
            stock: p.stock,
            quantity: p.quantity,
            importPrice: p.importPrice,
        }));

        const savedDepotDetails = await DepotDetail.insertMany(depotDetails);

        const updatePromises = savedDepotDetails.map(detail => {
            return Product.findById(detail.product).then(product => {
                if (product) {
                    const newStock = product.stock + detail.quantity;
                    product.stock = newStock;
                    return product.save();
                }
            });
        });
        await Promise.all(updatePromises);

        // Tạo phiếu nhập kho
        const depotEntry = {
            depotDetails: savedDepotDetails.map(detail => detail._id), // Mảng ObjectId của các chi tiết nhập kho đã lưu
            importUser: req.user.id, // ObjectId của người thực hiện nhập kho
            note: req.body.note, // Ghi chú cho phiếu nhập kho
        };
        const savedDepotEntry = await Depot.create(depotEntry);
        res.status(200).json({ data: { depots: savedDepotEntry }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// FIND ALL
router.get('/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const depots = await Depot.find()
            .populate({
                path: 'depotDetails',
                populate: {
                    path: 'product',
                },
            })
            .populate('importUser')
            .exec();
        res.status(200).json({ data: { depots, total: depots.length }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

module.exports = router;
