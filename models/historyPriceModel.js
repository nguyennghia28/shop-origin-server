const mongoose = require('mongoose');

const HistoryPriceSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
        oldPrice: {
            type: Number,
            required: true,
        },
        newPrice: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('HistoryPrice', HistoryPriceSchema);
