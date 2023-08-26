const router = require('express').Router();
const { default: mongoose } = require('mongoose');
const { verifyTokenAndAdmin, verifyTokenAndAuthorization } = require('../middleware/verifyToken');
const Promotion = require('../models/promotionModel');
const User = require('../models/userModel');
const Rank = require('../models/rankModel');
const moment = require('moment');
const SendMailUtil = require('../utils/sendEmail');

router.post('/', verifyTokenAndAdmin, async (req, res) => {
    const startDate = new Date(req.body.startDate);
    const timestampsStart = Math.floor(startDate.getTime());
    const endDate = new Date(req.body.endDate);
    const timestampsEnd = Math.floor(endDate.getTime());
    try {
        const newPromotion = new Promotion({
            titlevi: req.body.titlevi,
            titleen: req.body.titleen,
            type: req.body.type,
            forRank: req.body.forRank,
            code: req.body.code,
            value: req.body.value,
            startDate: timestampsStart,
            endDate: timestampsEnd,
            users: [],
            isDelete: req.body.isDelete,
        });
        await newPromotion.save();
        res.status(200).json({ data: { newPromotion }, message: 'success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// UPDATE
router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const startDate = req.body.startDate && new Date(req.body.startDate);
        const timestampsStart = startDate && Math.floor(startDate.getTime());
        const endDate = req.body.endDate && new Date(req.body.endDate);
        const timestampsEnd = endDate && Math.floor(endDate.getTime());

        const updatePromotion = await Promotion.findByIdAndUpdate(
            req.params.id,
            {
                $set: { ...req.body, startDate: timestampsStart, endDate: timestampsEnd },
            },
            { new: true, omitUndefined: true }
        );

        res.status(200).json({ data: { promotion: updatePromotion }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

router.put('/reset/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatePromotion = await Promotion.findByIdAndUpdate(
            req.params.id,
            {
                $set: { users: [] },
            },
            { new: true, omitUndefined: true }
        );

        res.status(200).json({ data: { promotion: updatePromotion }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// DELETE
router.put('/delete/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        await Promotion.findByIdAndUpdate(
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
        await Promotion.findByIdAndUpdate(
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
        const promotions = await Promotion.find();
        res.status(200).json({ data: { promotions: promotions }, message: 'success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// GET PROMOTION BY IDUser
// CUSTOMER
router.get('/myPromotion', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const promotions = await Promotion.find({ users: { $nin: [req.user.id] } }).exec();
        const user = await User.findById(req.user.id).populate('rank');
        const findRank = await Rank.find({ minValue: { $lte: user.rank.minValue } });

        const promotionUsed = await Promotion.find({ users: { $in: [req.user.id] } }).exec();
        const promotionAvailable = promotions
            .filter(
                item =>
                    new Date().getTime() > new Date(item.startDate).getTime() &&
                    new Date().getTime() < new Date(item.endDate).getTime() &&
                    item.type === 'normal'
            )
            .concat(promotions.filter(p => !!findRank.find(r => r._id.toString() === p.forRank)));
        res.status(200).json({ data: { promotionAvailable, promotionUsed }, message: 'success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// GET PROMOTION BY ID
router.get('/detailById/:id', async (req, res) => {
    try {
        const promotion = await Promotion.findOne({ _id: req.params.id }).exec();

        res.status(200).json({ data: { detailPromotion: promotion }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

//GET PROMOTIONS UNDELETED
router.get('/undeleted/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const promotions_undeleted = await Promotion.find({ isDelete: false, type: 'normal' })
            .sort({ createdAt: -1 })
            .exec();

        res.status(200).json({ data: { promotions_undeleted: promotions_undeleted }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error, status: 500 });
    }
});

//GET PROMOTIONS DELETED
router.get('/deleted/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const promotions_deleted = await Promotion.find({ isDelete: true, type: 'normal' })
            .sort({ createdAt: -1 })
            .exec();

        res.status(200).json({ data: { promotions_deleted: promotions_deleted }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error, status: 500 });
    }
});

//GET PROMOTIONS SPECIAL
router.get('/special/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const promotions_special = await Promotion.find({ type: 'special' }).exec();

        res.status(200).json({ data: { promotions_special: promotions_special }, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error, status: 500 });
    }
});

router.post('/sendEmailToUser', verifyTokenAndAdmin, async (req, res) => {
    try {
        var lstUser = [];
        if (req.body.rankId.trim().length > 0) {
            lstUser = await User.aggregate([
                {
                    $lookup: {
                        from: 'ranks',
                        localField: 'rank',
                        foreignField: '_id',
                        as: 'rank',
                    },
                },
                { $unwind: '$rank' },
                { $match: { 'rank._id': mongoose.Types.ObjectId(req.body.rankId), role: 'user' } },
            ]).exec();
        } else {
            lstUser = await User.aggregate([
                {
                    $lookup: {
                        from: 'ranks',
                        localField: 'rank',
                        foreignField: '_id',
                        as: 'rank',
                    },
                },
                { $unwind: '$rank' },
                { $match: { role: 'user' } },
            ]).exec();
        }
        const promotion = await Promotion.findById(req.body.promotionId);
        const promiseArr = lstUser.map(user => {
            SendMailUtil.sendMail(
                user.email,
                'MynhBakeStore thông báo chương trình khuyến mãi / MynhBakeStore Promotion announcement',
                `<h4>Chủ đề: Ưu đãi độc quyền giảm giá ${promotion.value}% dành riêng cho bạn!</h4>
                <br/>
<p>Chào <b>${user.username}!</b></p> <br/>         
<p>Chúng tôi mong rằng email này tìm được bạn trong tình trạng tốt đẹp. Chúng tôi muốn thông báo rằng hiện tại chúng tôi đang có chương trình khuyến mãi đặc biệt dành riêng cho khách hàng thân thiết. Trong một khoảng thời gian giới hạn, bạn sẽ được giảm giá <b>${
                    promotion.value
                }%</b> cho lần mua hàng tiếp theo của mình trên trang web của chúng tôi.</p> <br/>
<p>Cho dù bạn đang tìm kiếm một đôi giày mới hay cần cập nhật tủ đồ của mình cho mùa sắp tới, đây là thời điểm hoàn hảo để tự thưởng cho mình món đồ mới. Bộ sưu tập quần áo và phụ kiện cao cấp và thời trang của chúng tôi chắc chắn sẽ có một cái gì đó phù hợp với sở thích của bạn.</p> <br/>          
<p>Để tận dụng ưu đãi này, chỉ cần nhập mã khuyến mãi <b>${
                    promotion.code
                }</b> khi thanh toán. Nhưng hãy nhanh chân lên, ưu đãi này chỉ từ <b>${moment(
                    promotion.startDate
                ).format('DD/MM/YYYY')}</b> đến <b>${moment(promotion.endDate).format('DD/MM/YYYY')}</b>!</p> <br/>
<p>Cảm ơn bạn đã luôn ủng hộ. Chúng tôi mong muốn được phục vụ bạn sớm nhất.</p>
        
---------------------------------------------------------------------------------------------------------------------------
            
<h4>Subject: Exclusive ${promotion.value}% Off for You!</h4>
<p>Hello <b>${user.username}!</b></p> <br/>
<p>We hope this email finds you in good spirits. We would like to announce that we currently have a special promotion for our loyal customers. For a limited time, you will receive a <b>${
                    promotion.value
                }%</b> discount on your next purchase on our website.</p> <br/>
<p>Whether you're looking for a new pair of shoes or need to update your wardrobe for the upcoming season, this is the perfect time to treat yourself to something new. Our collection of premium clothing and fashion accessories is sure to have something that suits your taste.</p> <br/>
<p>To take advantage of this offer, simply enter the promo code <b>${
                    promotion.code
                }</b> at checkout. But hurry, this offer is only valid from <b>${moment(promotion.startDate).format(
                    'DD/MM/YYYY'
                )}</b> to <b>${moment(promotion.endDate).format('DD/MM/YYYY')}</b>!</p> <br/>
<p>Thank you for your continued support. We look forward to serving you soon.</p>
            `
            );
        });
        await Promise.all(promiseArr);
        res.status(200).json({ data: {}, message: 'success', status: 200 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});
// GET PROMOTION BY IDUser
// CUSTOMER
router.get('/myPromotion', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const promotions = await Promotion.find({ users: { $nin: [req.user.id] } }).exec();
        const user = await User.findById(req.user.id).populate('rank');
        const findRank = await Rank.find({ minValue: { $lte: user.rank.minValue } });

        const promotionUsed = await Promotion.find({ users: { $in: [req.user.id] } }).exec();
        const promotionAvailable = promotions
            .filter(
                item =>
                    new Date().getTime() > new Date(item.startDate).getTime() &&
                    new Date().getTime() < new Date(item.endDate).getTime() &&
                    item.type === 'normal'
            )
            .concat(promotions.filter(p => !!findRank.find(r => r._id.toString() === p.forRank)));
        res.status(200).json({ data: { promotionAvailable, promotionUsed }, message: 'success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});
module.exports = router;
