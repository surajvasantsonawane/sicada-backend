import tokenList from '../../../models/tokens'; // Adjust the path as necessary

const tokenServices = {

    // Create a new token
    createToken: async (tokenData) => {
        try {
            return await tokenList.create(tokenData);
        } catch (error) {
            // Handle error appropriately
            throw new Error(`Error creating token: ${error.message}`);
        }
    },

    // Find tokens based on a query
    findListTokens: async (query, project = {}) => {
        try {
            return await tokenList.find(query, project);
        } catch (error) {
            // Handle error appropriately
            throw new Error(`Error finding tokens: ${error.message}`);
        }
    },

    // Find a single token based on a query
    findToken: async (query) => {
        try {
            return await tokenList.findOne(query);
        } catch (error) {
            // Handle error appropriately
            throw new Error(`Error finding token: ${error.message}`);
        }
    },

    // Update a token based on a query
    updateToken: async (query, updateData) => {
        try {
            return await tokenList.findOneAndUpdate(query, updateData, { new: true });
        } catch (error) {
            // Handle error appropriately
            throw new Error(`Error updating token: ${error.message}`);
        }
    },

    // Upsert (update or insert) a token based on a query
    upsertToken: async (query, updateData) => {
        try {
            return await tokenList.findOneAndUpdate(query, updateData, { new: true, upsert: true });
        } catch (error) {
            // Handle error appropriately
            throw new Error(`Error upserting token: ${error.message}`);
        }
    },

    // Delete a token based on a query
    deleteToken: async (query) => {
        try {
            return await tokenList.findOneAndDelete(query);
        } catch (error) {
            // Handle error appropriately
            throw new Error(`Error deleting token: ${error.message}`);
        }
    },

    // aggregate the tokens
    aggregateTokens: async (query) => {
        try {
            return await tokenList.aggregate(query);
        } catch (error) {
            // Handle error appropriately
            throw new Error(`Error aggregating tokens: ${error.message}`);
        }
    },
};

module.exports = { tokenServices };
