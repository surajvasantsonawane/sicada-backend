import orderListModel from "../../../models/orderList";
import status from '../../../enums/status';

const orderListServices = {
    createOrderList: async (insertObj) => {
        return await orderListModel.create(insertObj);
    },

    findOrderList: async (query, project) => {
        return await orderListModel.find(query, project);
    },

    findOrderListById: async (query) => {
        return await orderListModel.findOne(query);
    },

    updateOrderList: async (query, updateObj) => {
        return await orderListModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    upsertOrderList: async (query, updateObj) => {
        return await orderListModel.findOneAndUpdate(query, updateObj, { new: true, upsert: true });
    },
};

module.exports = { orderListServices };