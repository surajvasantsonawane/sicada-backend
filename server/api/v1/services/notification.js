
import notificationModel from "../../../models/notification.js";


const notificationServices = {

    createNotification: async (insertObj) => {
        return await notificationModel.create(insertObj);
    },

    findNotification: async (query) => {
        return await notificationModel.findOne(query);
    },

    updateNotification: async (query, updateObj) => {
        return await notificationModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    notificationList: async (query) => {
        return await notificationModel.find(query);
    }


}

module.exports = { notificationServices };