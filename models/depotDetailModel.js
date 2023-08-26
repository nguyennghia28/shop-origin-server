const mongoose = require('mongoose');

const DepotDetailSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    importPrice: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('DepotDetail', DepotDetailSchema);
