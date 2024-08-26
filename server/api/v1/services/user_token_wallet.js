import userTokenWalletModel from "../../../models/user_token_wallet"; // Adjust path as needed

const userTokenWalletServices = {

  // Create a new user token wallet
  createUserTokenWallet: async (insertObj) => {
    try {
      return await userTokenWalletModel.create(insertObj);
    } catch (error) {
      // Handle error appropriately
      throw new Error(`Error creating user token wallet: ${error.message}`);
    }
  },

  // Find a user token wallet by query
  findUserTokenWallet: async (query) => {
    try {
      return await userTokenWalletModel.findOne(query);
    } catch (error) {
      // Handle error appropriately
      throw new Error(`Error finding user token wallet: ${error.message}`);
    }
  },

  // Update a user token wallet by query
  updateUserTokenWallet: async (query, updateObj) => {
    try {
      return await userTokenWalletModel.findOneAndUpdate(query, updateObj, { new: true });
    } catch (error) {
      // Handle error appropriately
      throw new Error(`Error updating user token wallet: ${error.message}`);
    }
  },

  // Upsert (update or insert) a user token wallet by query
  upsertUserTokenWallet: async (query, updateObj) => {
    try {
      return await userTokenWalletModel.findOneAndUpdate(query, updateObj, { new: true, upsert: true });
    } catch (error) {
      // Handle error appropriately
      throw new Error(`Error upserting user token wallet: ${error.message}`);
    }
  },
};

module.exports = { userTokenWalletServices };
