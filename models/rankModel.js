const mongoose = require('mongoose');

const RankSchema = mongoose.Schema(
    {
        namevi: {
            type: String,
            required: true,
        },
        nameen: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
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
        minValue: {
            type: Number,
            required: true,
        },
        maxValue: {
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

module.exports = mongoose.model('Rank', RankSchema);
