import deposite_wallet_address from "../../../models/deposite_wallet_address"; // Adjust the import path as needed

const depositeWalletServices = {
    // Create a new deposit wallet address
    createDepositWallet: async (insertObj) => {
        try {
            const result = await deposite_wallet_address.create(insertObj);
            return result;
        } catch (error) {
            throw new Error(`Error creating deposit wallet: ${error.message}`);
        }
    },

    // Find deposit wallet addresses based on query
    findDepositWallets: async (query, project) => {
        try {
            const result = await deposite_wallet_address.find(query, project);
            return result;
        } catch (error) {
            throw new Error(`Error finding deposit wallets: ${error.message}`);
        }
    },

    // Find a single deposit wallet address based on query
    findDepositWallet: async (query) => {
        try {
            const result = await deposite_wallet_address.findOne(query);
            return result;
        } catch (error) {
            throw new Error(`Error finding deposit wallet: ${error.message}`);
        }
    },

    // Update a deposit wallet address based on query
    updateDepositWallet: async (query, updateObj) => {
        try {
            const result = await deposite_wallet_address.findOneAndUpdate(query, updateObj, { new: true });
            return result;
        } catch (error) {
            throw new Error(`Error updating deposit wallet: ${error.message}`);
        }
    },

    // Upsert a deposit wallet address (update if exists, create if not)
    upsertDepositWallet: async (query, updateObj) => {
        try {
            const result = await deposite_wallet_address.findOneAndUpdate(query, updateObj, { new: true, upsert: true });
            return result;
        } catch (error) {
            throw new Error(`Error upserting deposit wallet: ${error.message}`);
        }
    },
};

module.exports = { depositeWalletServices };
