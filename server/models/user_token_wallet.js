import Mongoose, { Schema } from "mongoose";

const userTokenWalletSchema = new Schema({
  userId: { type: Mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  token_address: {
    EVM_Based: {
      address: { type: String },
      privateKey: { iv: { type: String }, key: { type: String } },
    },
    TRON_Based: {
      address: { type: String },
      privateKey: { iv: { type: String }, key: { type: String } },
    }
  }
}, {
  collection: "user_token_wallet",
  timestamps: true,
});

export default Mongoose.model("user_token_wallet", userTokenWalletSchema);
