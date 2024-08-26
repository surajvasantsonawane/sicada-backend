
import userModel from "../../../models/user";
import status from '../../../enums/status';
import userType from "../../../enums/userType";



const userServices = {

  createUser: async (insertObj) => {
    return await userModel.create(insertObj);
  },
 
  findUser: async (query) => {
    return await userModel.findOne(query);
  },

  updateUser: async (query, updateObj) => {
    return await userModel.findOneAndUpdate(query, updateObj, { new: true }).select('-otp');
  },

  checkUserExists: async (email ) => {
    let query = { email: email,  userType: userType.USER }
    return await userModel.findOne(query);
  },

  emailUsernameExist: async ( email, id) => {
    let query = { $and: [{ status: { $ne: status.DELETE } }, { _id: { $ne: id } }, { email: email }] }
    return await userModel.findOne(query);
  },

  emailMobileExist: async (mobileNumber, email) => {
    let query = { $and: [{ status: { $ne: status.DELETE } }, { $or: [{ email: email }, { mobileNumber: mobileNumber }] }] }
    return await userModel.findOne(query);
  },
}

module.exports = { userServices };

