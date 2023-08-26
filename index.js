const express = require('express');
const cors = require('cors');
const { connectDB } = require('./database/db');
const { PORT } = require('./utils/config');

const auth = require('./routers/auth');
const userRoute = require('./routers/userRoute');
const productRoute = require('./routers/productRoute');
const collectionRoute = require('./routers/collectionRoute');
const orderRoute = require('./routers/orderRoute');
const promotionRoute = require('./routers/promotionRoute');
const rankRoute = require('./routers/rankRoute');
const postRoute = require('./routers/postRoute');
const notificationRoute = require('./routers/notificationRoute');
const oneSignalRoute = require('./routers/oneSignalRoute');
const depotRoute = require('./routers/depotRoute');
const historyPriceRoute = require('./routers/historyPriceRoute');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', auth);
app.use('/api/user', userRoute);
app.use('/api/product', productRoute);
app.use('/api/collections', collectionRoute);
app.use('/api/order', orderRoute);
app.use('/api/promotion', promotionRoute);
app.use('/api/rank', rankRoute);
app.use('/api/post', postRoute);
app.use('/api/notification', notificationRoute);
app.use('/api/onesignal', oneSignalRoute);
app.use('/api/depot', depotRoute);
app.use('/api/historyPrice', historyPriceRoute);

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
