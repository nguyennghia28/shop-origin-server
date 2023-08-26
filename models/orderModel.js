const mongoose = require('mongoose');

const orderStatus = {
    state: {
        type: String,
        enum: ['PENDING', 'PACKAGE', 'DELIVERING', 'COMPLETE', 'CANCEL'],
        required: true,
    },
    pendingDate: {
        type: Date,
        required: true,
    },
    packageDate: {
        type: Date,
        required: true,
    },
    deliveringDate: {
        type: Date,
        required: true,
    },
    completeDate: {
        type: Date,
        required: true,
    },
    cancelDate: {
        type: Date,
        required: true,
    },
};

const OrderSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },

        promotion: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', required: false },
        orderDetails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderDetail', required: true }],
        recipient: {
            type: {
                username: {
                    type: String,
                    required: true,
                },
                phone: {
                    type: String,
                    required: true,
                },
                addressProvince: {
                    type: Object,
                    required: true,
                },
                addressDistrict: {
                    type: Object,
                    required: true,
                },
                addressWard: {
                    type: Object,
                    required: true,
                },
                address: {
                    type: String,
                    required: true,
                },
            },
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        note: {
            type: String,
            required: false,
        },
        paymentStatus: {
            type: String,
            required: true,
        },
        paymentType: {
            type: String,
            required: true,
        },
        status: {
            type: orderStatus,
            required: true,
        },

        originalPrice: {
            type: Number,
            required: true,
        },
        shipPrice: {
            type: Number,
            required: true,
        },
        discountPrice: {
            type: Number,
            required: true,
        },
        finalPrice: {
            type: Number,
            required: true,
        },
        leadtime: {
            type: String,
            // required: true,
        },
        dateOrdered: {
            type: Date,
            default: Date.now,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
