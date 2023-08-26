const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        collectionObj: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', require: true },
        brand: {
            type: String,
            required: true,
        },
        type: {
            type: String,
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
        sex: {
            type: String,
            required: true,
        },
        images: {
            type: Array,
            required: true,
        },
        descriptionvi: {
            type: String,
            required: true,
        },
        descriptionen: {
            type: String,
            required: true,
        },
        featuresvi: {
            type: Array,
            required: true,
        },
        featuresen: {
            type: Array,
            required: true,
        },
        note: {
            type: String,
        },
        sold: {
            type: Number,
            required: true,
        },
        stock: {
            type: Number,
            required: true,
        },
        isDelete: {
            type: Boolean,
            default: false,
            required: true,
        },
    },
    { timestamps: true }
);

ProductSchema.indexes({
    name: 'text',
    brand: 'text',
    descriptionvi: 'text',
    descriptionen: 'text',
    sex: 'text',
    note: 'text',
    type: 'text',
});

module.exports = mongoose.model('Product', ProductSchema);
