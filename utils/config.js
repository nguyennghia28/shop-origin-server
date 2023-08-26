const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URL = process.env.MONGODB_URL || '';
const PORT = process.env.PORT || 8080;

const GHN = axios.create({
    baseURL: 'https://online-gateway.ghn.vn/shiip/public-api/',
    headers: {
        'Content-Type': 'application/json',
        Token: process.env.TOKEN_GHN,
        ShopId: process.env.SHOPID,
    },
});

GHN.interceptors.request.use(async config => config);

GHN.interceptors.response.use(
    response => {
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    error => {
        throw error;
    }
);

const address = async (type, id) => {
    var resGHN = {};
    switch (type) {
        case 'province':
            resGHN = await GHN.post('master-data/province');
            break;
        case 'district':
            resGHN = await GHN.post('master-data/district', {
                province_id: id,
            });
            break;
        case 'ward':
            resGHN = await GHN.post('master-data/ward', {
                district_id: id,
            });
            break;
        default:
            break;
    }
    return resGHN.data;
};

const estimate = async (districtId, wardId) => {
    const resGHN = await GHN.post('v2/shipping-order/fee', {
        shop_id: process.env.SHOPID,
        service_type_id: 2,
        insurance_value: 0,
        coupon: '',
        from_district_id: 1461,
        to_district_id: districtId,
        to_ward_code: wardId,
        weight: 500,
        length: 20,
        width: 4,
        height: 1,
    });
    return resGHN.data.total;
};

const leadtime = async (districtId, wardId) => {
    const resLeadtime = await GHN.post('v2/shipping-order/leadtime', {
        from_district_id: 1461,
        from_ward_code: '21303',
        to_district_id: districtId,
        to_ward_code: wardId,
        service_id: 53320,
    });
    return resLeadtime.data.leadtime;
};

module.exports = { MONGO_URL, PORT, GHN, estimate, leadtime, address };
