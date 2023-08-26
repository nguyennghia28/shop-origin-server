const mongoose = require('mongoose');
const { MONGO_URL } = require('../utils/config');

const connectDB = async () => {
    if (!MONGO_URL) {
        console.log('MONGO_URL is not defined in the env');
    }
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(MONGO_URL, { useUnifiedTopology: true, useNewUrlParser: true, ignoreUndefined: true });
        console.log('MongoDB connected');
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
};

module.exports = { connectDB };
