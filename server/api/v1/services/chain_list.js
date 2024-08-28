import chainListModel from "../../../models/chainList";
import status from '../../../enums/status';

const chainListServices = {
    createChainList: async (insertObj) => {
        return await chainListModel.create(insertObj);
    },

    findChainList: async (query, project) => {
        return await chainListModel.find(query, project);
    },

    findChain: async (query) => {
        return await chainListModel.findOne(query);
    },

    updateChainList: async (query, updateObj) => {
        return await chainListModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    upsertChainList: async (query, updateObj) => {
        return await chainListModel.findOneAndUpdate(query, updateObj, { new: true, upsert: true });
    },
};

module.exports = { chainListServices };