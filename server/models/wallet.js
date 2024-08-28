import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from "../enums/status";
import accountType from "../enums/accountType";

const options = {
  collection: "user_wallet",
  timestamps: true,
};

const userWalletModel = new Schema(
  {
    balance: { type: Number, default: 0 },
    userId: { type: Mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  options
);
userWalletModel.plugin(mongoosePaginate);
userWalletModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("user_wallet", userWalletModel);