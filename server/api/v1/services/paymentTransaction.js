import userPaymentTransactionSchema from "../../../models/userPaymentTransaction";
import status from '../../../enums/status';

const paymentTransactionServices = {
    createPaymentTransaction: async (insertObj) => {
        return await userPaymentTransactionSchema.create(insertObj);
    },

    findPaymentTransaction: async (query, project) => {
        return await userPaymentTransactionSchema.find(query, project);
    },

    findSinglePayment: async (query) => {
        return await userPaymentTransactionSchema.findOne(query);
    },

    updateCurrency: async (query, updateObj) => {
        return await userPaymentTransactionSchema.findOneAndUpdate(query, updateObj, { new: true });
    },

    upsertCurrency: async (query, updateObj) => {
        return await userPaymentTransactionSchema.findOneAndUpdate(query, updateObj, { new: true, upsert: true });
    },
};

module.exports = { paymentTransactionServices };