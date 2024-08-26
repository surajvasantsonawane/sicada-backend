import tokenListModel from "../../../models/tokensContractAddress";
import status from '../../../enums/status';

const tokenListServices = {
    createTokenList: async (insertObj) => {
        return await tokenListModel.create(insertObj);
    },

    findToken: async (query) => {
        return await tokenListModel.findOne(query);
    },
    
    findTokenList: async (query) => {
        return await tokenListModel.find(query);
    },

    updateTokenList: async (query, updateObj) => {
        return await tokenListModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    upsertTokenList: async (query, updateObj) => {
        return await tokenListModel.findOneAndUpdate(query, updateObj, { new: true, upsert: true });
    },
};


module.exports = { tokenListServices };