import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userType from "../enums/userType";
import status from "../enums/status";
import accountType from "../enums/accountType";
import { Certificate } from "crypto";

const options = {
  collection: "user",
  timestamps: true,
};

const userModel = new Schema(
  {
    name: { type: String, default: null },
    email: { type: String },
    password: { type: String },
    countryCode: { type: String, default: null },
    mobileNumber: { type: Number, default: null },
    isAccountCreated: { type: Boolean, default: false },
    finalConfirmation: { type: Boolean, default: false },
    panCardNumber: { type: String, default: null },
    aadhaarCardNumber: { type: String, default: null },
    bankStatement: { type: String, default: null },
    gstCertificate: { type: String, default: null },
    certificateOfIncorporation: { type: String, default: null },
    EAOA: { type: String, default: null },
    EMOA: { type: String, default: null },
    sourceOfPayment: {
      type: String,
      enum: ["SALARY", "BUSINESS", "INVESTMENT", "SAVINGS", "OTHER"],
    },
    p2pMerchant: { type: Boolean },
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
    accountType: {
      type: String,
      enum: [accountType.CORPORATE, accountType.INDIVIDUAL],
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