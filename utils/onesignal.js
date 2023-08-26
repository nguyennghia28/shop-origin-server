const Request = require('request-promise');
const { chunk } = require('lodash');

class OneSignalUtil {
    static async pushNotification({ isAdmin, heading, content, oneSignalPlayerIds, data, pathUrl = '/' }) {
        var appId = '';
        var restApiKey = '';
        var callbackUrl = '';
        if (isAdmin) {
            appId = process.env.APP_ID_ADMIN;
            restApiKey = process.env.REST_API_KEY_ADMIN;
            callbackUrl = process.env.CALLBACK_URL_ADMIN;
        } else {
            appId = process.env.APP_ID_CUSTOMER;
            restApiKey = process.env.REST_API_KEY_CUSTOMER;
            callbackUrl = process.env.CALLBACK_URL_CUSTOMER;
        }

        const chunkArray = chunk(oneSignalPlayerIds, 1000);
        for (const itemChunk of chunkArray) {
            const response = await Request({
                method: 'POST',
                uri: 'https://onesignal.com/api/v1/notifications',
                headers: {
                    Authorization: `Basic ${restApiKey}`,
                },
                body: {
                    app_id: appId,
                    contents: { en: content },
                    headings: { en: heading },
                    include_player_ids: itemChunk,
                    url: callbackUrl + pathUrl,
                    data,
                },
                json: true,
            });
        }
    }

    static async pushNotificationAll({ content, heading, url, data, userType = 'admin' }) {
        try {
            const { appId, callbackUrl, restApiKey } = this.getConfig(userType);

            const response = await Request({
                method: 'POST',
                uri: 'https://onesignal.com/api/v1/notifications',
                headers: {
                    Authorization: `Basic ${restApiKey}`,
                },
                body: {
                    app_id: appId,
                    contents: { en: content },
                    headings: { en: heading },
                    included_segments: ['All'],
                    url: callbackUrl + url,
                    data,
                },
                json: true,
            });
        } catch (error) {}
    }
}
module.exports = OneSignalUtil;
