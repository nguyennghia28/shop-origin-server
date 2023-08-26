const mongoose = require("mongoose");

const OneSignal = new mongoose.Schema({
    oneSignalId: {
        type: String,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
},{ timestamps: true });

module.exports = mongoose.model("OneSignal", OneSignal);
