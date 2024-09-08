import cryptoTransactionSchema from "../../../models/cryptoTransactions";
import status from '../../../enums/status';

const cryptoTransactionServices = {
    createCryptoTransactions: async (insertObj) => {
        return await cryptoTransactionSchema.create(insertObj);
    },

    findCryptoTransactions: async (query, project) => {
        return await cryptoTransactionSchema.find(query, project);
    },
    findCryptoTransactionsPopulateUser: async (query, project) => {
        return await cryptoTransactionSchema.find(query, project).populate("userId", "name");
    },
    findSingleCryptoTransactions: async (query) => {
        return await cryptoTransactionSchema.findOne(query);
    },

    updateCryptoTransactions: async (query, updateObj) => {
        return await cryptoTransactionSchema.findOneAndUpdate(query, updateObj, { new: true });
    },

    upsertCryptoTransactions: async (query, updateObj) => {
        return await cryptoTransactionSchema.findOneAndUpdate(query, updateObj, { new: true, upsert: true });
    },

    cryptoTransactionAggregate: async (pipeline) => {
        return await cryptoTransactionSchema.aggregate(pipeline);
    }
};

module.exports = { cryptoTransactionServices };