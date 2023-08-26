const router = require('express').Router();
const { ObjectId } = require('bson');

const { verifyTokenAndAdmin, verifyTokenAndAuthorization } = require('../middleware/verifyToken');
const Notification = require('../models/notificationModel');

//GET ALL OF ADMIN
router.get('/admin/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const notifications = await Notification.find({
            isDeleted: false,
            from: 'customer',
        })
            .populate(['user', 'order'])
            .sort({ createdAt: 'desc' });
        res.status(200).json({
            data: { notifications: notifications, total: notifications.length },
            message: 'success',
            status: 200,
        });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

//GET ALL OF ADMIN
router.get('/admin/notseen/',verifyTokenAndAdmin, async (req, res) => {
    try {
        const notifications = await Notification.find({
            isDeleted: false,
            from:"customer",
            isSeen: false
        }).populate(["user", "order"]).sort({ createdAt: "desc" });
        res.status(200).json({ data: { notifications:notifications, total: notifications.length }, message: 'success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

//GET ALL OF USER
router.get('/', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const notifications = await Notification.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order',
                    foreignField: '_id',
                    as: 'order',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $unwind: '$order',
            },
            {
                $match: {
                    'user._id': ObjectId(req.user.id),
                },
            },
        ]);
        res.status(200).json({
            data: { notifications: notifications, total: notifications.length },
            message: 'success',
            status: 200,
        });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

// SEEN ALL
// CUSTOMER
router.put('/seenAll', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const notification = await Notification.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $match: {
                    'user._id': ObjectId(req.user.id),
                },
            },
            {
                $set: {
                    isSeen: true,
                },
            },
        ]);
        res.status(200).json({ data: { notification: notification }, message: 'seen success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

//DELETE
router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        notification.isDeleted = true;

        await Notification.save(notification);
        res.status(200).json({ data: {}, message: 'delete success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

//GET DETAIL
router.get('/detail/:id', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id)
            .populate('user')
            .populate({
                path: 'order',
                populate: {
                    path: 'orderDetails',
                },
            });
        res.status(200).json({ data: { notification: notification }, message: 'delete success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

//IS SEENED
router.put('/seen/:id', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            {
                $set: { isSeen: true },
            },
            { new: true }
        );
        res.status(200).json({ data: { notification: notification }, message: 'seen success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

module.exports = router;
