import userWalletModel from "../../../models/wallet";
import status from '../../../enums/status';

const userWalletServices = {

  createUserWallet: async (insertObj) => {
    return await userWalletModel.create(insertObj);
  },
 
  findUserWallet: async (query) => {
    return await userWalletModel.findOne(query);
  },

  updateUserWallet: async (query, updateObj) => {
    return await userWalletModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  upsertUserWallet: async (query, updateObj) => {
    return await userWalletModel.findOneAndUpdate(query, updateObj, { new: true, upsert: true });
  },
}

module.exports = { userWalletServices };

