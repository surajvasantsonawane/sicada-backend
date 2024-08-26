import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from "../enums/status";
import accountType from "../enums/accountType";

const options = {
  collection: "walletAddress",
  timestamps: true,
};

const walletAddressModel = new Schema(
  {
    address: { type: String, default: null },
    balance: { type: Number, default: 0 },
    private: {
      key: { type: String, default: null },
      iv: { type: String, default: null },
    },
    status: {
      type: String,
      enum: [status.ACTIVE, status.BLOCK, status.DELETE],
      default: status.ACTIVE,
    },
    userId: { type: Mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  options
);
walletAddressModel.plugin(mongoosePaginate);
walletAddressModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("walletAddress", walletAddressModel);

(async () => {
    try {
        const result = await Mongoose.model("walletAddress", walletAddressModel).find();
        if (result.length != 0) {
            console.log("Token List 😀.");
        } else {
            const tokens = [
                {
                    id: 'tether',
                    name: 'Tether',
                    symbol: 'USDT',
                    type: 'ERC-20',
                    contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7', // Ethereum address for USDT
                    decimals: 6,
                    chainId: 1, // Ethereum Mainnet
                    logo: "https://s2.coinmarketcap.com/static/img/coins/200x200/825.png"
                },
                {
                    id: 'tether',
                    name: 'Tether',
                    symbol: 'USDT',
                    type: 'BEP-20',
                    contractAddress: '0x55d398326f99059ff775485246999027b319795', // Binance Smart Chain address for USDT
                    decimals: 18,
                    chainId: 56, // Binance Smart Chain Mainnet
                    logo: "https://s2.coinmarketcap.com/static/img/coins/200x200/825.png"
                }
            ];

  

        }
    } catch (error) {
        console.log("Admin error===>>", error);
    }
}).call();