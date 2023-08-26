const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OTPSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true,
    },
    OTP: { type: String, required: true },
    expires: { type: Number, default: Date.now() + 3600000 },
});

module.exports = mongoose.model('OTP', OTPSchema);
