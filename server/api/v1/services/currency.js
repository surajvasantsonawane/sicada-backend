import currencySchema from "../../../models/currency";
import status from '../../../enums/status';

const currencyServices = {
    createCurrency: async (insertObj) => {
        return await currencySchema.create(insertObj);
    },

    findCurrency: async (query, project) => {
        return await currencySchema.find(query, project);
    },

    findSingleCurrency: async (query) => {
        return await currencySchema.findOne(query);
    },

    updateCurrency: async (query, updateObj) => {
        return await currencySchema.findOneAndUpdate(query, updateObj, { new: true });
    },

    upsertCurrency: async (query, updateObj) => {
        return await currencySchema.findOneAndUpdate(query, updateObj, { new: true, upsert: true });
    },
};

module.exports = { currencyServices };