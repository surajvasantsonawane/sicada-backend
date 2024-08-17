import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userType from "../enums/userType";
import status from "../enums/status";
import bcrypt from "bcryptjs";

const options = {
  collection: "user",
  timestamps: true,
};

const userModel = new Schema(
  {
    name: { type: String, default: "" },
    country: { type: String, default: "" },
    userName: { type: String, default: "" },
    email: { type: String },
    password: {type: String},
    profilePic: { type: String, default: "" },
    countryCode: { type: String, default: "" },
    mobileNumber: { type: String, default: "" },
    password: { type: String },
    otp: { type: Number },
    otpTime: { type: Number },
    otpVerification: { type: Boolean, default: false },
    subscriptionPlan: { type: Boolean, default: false },
    walletAddress: { type: String, default: "" },
    accountType: {
      type: String
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


(async () => {
  try {
    const result = await Mongoose.model("user", userModel).find({ userType: userType.ADMIN });
    if (result.length != 0) {
      console.log("Default Admin 😀.");
    } else {
      const createdRes = await Mongoose.model("user", userModel).create({
        userType: userType.ADMIN,
        name: "Vinay",
        countryCode: "+91",
        mobileNumber: "9876543210",
        email: "vinay-ad@mailinator.com",
        password: bcrypt.hashSync("Mobiloitte@1"),
        otpVerification: true,
      });
      if (createdRes) {
        console.log("DEFAULT ADMIN Created 😀 ", createdRes);
      }
    }
  } catch (error) {
    console.log("Admin error===>>", error);
  }
}).call();
