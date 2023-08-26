const router = require('express').Router();
const { verifyTokenAndAuthorization } = require('../middleware/verifyToken');
const OneSignal = require('../models/oneSignalModel');

//POST
router.post('/sub', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const oldOneSignal = await OneSignal.findOne({
            oneSignalId: req.body.oneSignalId,
        });

        if (oldOneSignal || !req.body.oneSignalId) {
            return res.status(200).json({ data: {}, message: 'success', status: 200 });
        }

        const data = {
            oneSignalId: req.body.oneSignalId,
            user: req.user.id,
        };

        const onesignal = await OneSignal.create(data);

        res.status(200).json({ data: { onesignal: onesignal }, message: 'success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

//DELETE
router.delete('/unsub', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const oldOneSignal = await OneSignal.findOne({
            oneSignalId: req.body.oneSignalId,
        });

        if (oldOneSignal) {
            await oldOneSignal.remove(oldOneSignal);
        }

        res.status(200).json({ data: {}, message: 'delete success', status: 200 });
    } catch (error) {
        res.status(500).json({ data: {}, message: error.message, status: 500 });
    }
});

module.exports = router;
