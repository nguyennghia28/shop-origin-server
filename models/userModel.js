const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        password: {
            type: String,
        },
        phone: {
            type: String,
            required: false,
            default: '',
        },
        address: {
            type: Object,
            required: false,
            default: {},
        },
        sex: {
            type: String,
            required: false,
            default: '',
        },
        role: {
            type: String,
            default: 'user',
            required: true,
        },
        rank: { type: mongoose.Schema.Types.ObjectId, ref: 'Rank', require: true },
        verified: { type: Boolean, default: false },
        isDelete: {
            type: Boolean,
            default: false,
            required: true,
        },
        facebookId: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
