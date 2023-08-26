const mongoose = require('mongoose');

const DepotSchema = mongoose.Schema(
    {
        depotDetails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DepotDetail', required: true }],
        importUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
        note: { type: String, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Depot', DepotSchema);
