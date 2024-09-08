import setValueSchema from "../../../models/setValue";
import status from '../../../enums/status';

const setValueServices = {
    setValueLimit: async (insertObj) => {
        return await setValueSchema.create(insertObj);
    },

    findAllValues: async (query, project) => {
        return await setValueSchema.find(query, project);
    },

    findValue: async (query) => {
        return await setValueSchema.findOne(query);
    },

    updateValueLimit: async (query, updateObj) => {
        return await setValueSchema.findOneAndUpdate(query, updateObj, { new: true });
    },

    upsertCurrency: async (query, updateObj) => {
        return await setValueSchema.findOneAndUpdate(query, updateObj, { new: true, upsert: true });
    },
};

module.exports = { setValueServices };