import bankDetailsModel from "../../../models/bankDetails";
import status from '../../../enums/status';

const bankDetailsServices = {
    createBankDetails: async (insertObj) => {
        return await bankDetailsModel.create(insertObj);
    },

    findBankDetails: async (query, project) => {
        return await bankDetailsModel.find(query, project);
    },

    findSingleBankDetails: async (query) => {
        return await bankDetailsModel.findOne(query);
    },

    updateBankDetails: async (query, updateObj) => {
        return await bankDetailsModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    upsertBankDetails: async (query, updateObj) => {
        return await bankDetailsModel.findOneAndUpdate(query, updateObj, { new: true, upsert: true });
    },
};

module.exports = { bankDetailsServices };