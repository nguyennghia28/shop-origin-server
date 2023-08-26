const mongoose = require('mongoose');

const PostSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: false,
        },
        image: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        // isDelete: {
        //     type: Boolean,
        //     default: false,
        //     required: true,
        // },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);
