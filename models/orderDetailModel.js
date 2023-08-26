const mongoose = require('mongoose');

const OrderDetailSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    originalPrice: {
        type: Number,
        required: true,
    },
    finalPrice: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('OrderDetail', OrderDetailSchema);
