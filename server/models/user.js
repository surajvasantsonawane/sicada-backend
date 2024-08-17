import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userType from "../enums/userType";
import status from "../enums/status";
import accountType from "../enums/accountType";

const options = {
  collection: "user",
  timestamps: true,
};

const userModel = new Schema(
  {
    name: { type: String, default: null },
    userName: { type: String, default: null },
    email: { type: String },
    password: { type: String },
    profilePic: { type: String, default: null },
    countryCode: { type: String, default: null },
    mobileNumber: { type: Number, default: null },

    otp: {
      email: { type: Number, default: null },
      mobile: { type: Number, default: null },
    },
    otpExpireTime: {
      email: { type: Number, default: null },
      mobile: { type: Number, default: null },
    },
    otpVerification: {
      email: { type: Boolean, default: false },
      mobile: { type: Boolean, default: false },
    },

    isAccountCreated: { type: Boolean, default: false },

    accountType: {
      type: String,
      enum: [accountType.CORPORATE, accountType.PRIVATE],
    },
    userType: {
      type: String,
      enum: [userType.ADMIN, userType.USER],
      default: userType.USER,
    },
    status: {
      type: String,
      enum: [status.ACTIVE, status.BLOCK, status.DELETE],
      default: status.ACTIVE,
    }

  },
  options
);
userModel.plugin(mongoosePaginate);
userModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("user", userModel);