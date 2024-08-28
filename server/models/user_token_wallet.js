import Mongoose, { Schema } from "mongoose";



const userTokenWalletSchema = new Schema({
  userId: { type: Mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  token_address: {
    EVM_Based: {
      address: { type: String, required: true }, // User's wallet address
      privateKey: { type: String, required: true }, // User's private key (encrypted for security)
    }
  }
}, {
  collection: "user_token_wallet",
  timestamps: true,
});

// // `pre` middleware to set default values
// userTokenWalletSchema.pre('save', function(next) {
//   if (!this.token_address.bnb) {
//     this.token_address.bnb = { 'BEP-20': "0xB8c77482e45f1f44de1745f52c74426c6319d4ce", 'ERC-20': "0xB8c77482e45f1f44de1745f52c74426c6319d4ce" };
//   }
//   if (!this.token_address.usdt) {
//     this.token_address.usdt = { 'BEP-20': "0x55d398326f99059fF775485246999027B319795", 'ERC-20': "0xdac17f958d2ee523a2206206994597c13d831ec7" };
//   }

//   next(); // Proceed to save the document
// });

export default Mongoose.model("user_token_wallet", userTokenWalletSchema);
