const router = require('express').Router();

const { verifyTokenAndAdmin } = require('../middleware/verifyToken');
const HistoryPrice = require('../models/historyPriceModel');

//GET ADMIN
router.get('/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const historyPriceAll = await HistoryPrice.find({}).populate(['user', 'product']).sort({ createdAt: 'desc' });
        const historyPrices = historyPriceAll.filter(item => item.product._id.toString() === req.query.productId);
        res.status(200).json({
            data: { historyPrices, total: historyPrices.length },
            message: 'success',
            status: 200,
        });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

module.exports = router;
