const mongoose = require("mongoose");

const Notification = new mongoose.Schema({
    title: {
        type: String,
    },
    content: {
        type: String,
    },
    shortContent: {
        type: String,
    },
    order: {
        type: mongoose.Schema.ObjectId,
        ref: "Order",
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    type: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    mode: {
        type: String,
        default: "global",
    },
    from: {
        type: String,
        default: "admin",
    },
    lastSendAt: {
        type: Number,
        default: 0,
    },
    isSeen: {
        type: Boolean,
        default: false,
    },
},{ timestamps: true });

module.exports = mongoose.model("Notification", Notification);
