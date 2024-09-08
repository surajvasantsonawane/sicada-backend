import countriesListModel from "../../../models/countries";
import status from '../../../enums/status';

const countriesListServices = {
    createCountriesList: async (insertObj) => {
        return await countriesListModel.create(insertObj);
    },

    findCountriesList: async (query, project) => {
        return await countriesListModel.find(query, project);
    },

    findSingleCountriesList: async (query) => {
        return await countriesListModel.findOne(query);
    },

    updateCountriesList: async (query, updateObj) => {
        return await countriesListModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    upsertCountriesList: async (query, updateObj) => {
        return await countriesListModel.findOneAndUpdate(query, updateObj, { new: true, upsert: true });
    },
};

module.exports = { countriesListServices };