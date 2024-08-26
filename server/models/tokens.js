import ChainList from './chainList';
import status from "../enums/status";

import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const tokenSchema = new mongoose.Schema(
    {
        id: { type: String, required: true }, // Name of the token
        name: { type: String, required: true }, // Name of the token
        symbol: { type: String, required: true }, // Symbol of the token
        logo: { type: String, required: true },
        chainId: { type: [Number], required: true }, // Array of chain IDs where the token is deployed
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE,
          }
    },
    {
        collection: 'tokens',
        timestamps: true,
    }
);

tokenSchema.plugin(mongoosePaginate);
tokenSchema.plugin(mongooseAggregatePaginate);


const tokenList = mongoose.model('tokens', tokenSchema);

export default tokenList;

 
(async () => {
    try {
        const result = await mongoose.model("tokens", tokenSchema).find();
        if (result.length != 0) {
            console.log("Token List 😀.");
        } else {
            const tokens = [
                {
                    id: 'tether',
                    name: 'Tether',
                    symbol: 'USDT',
                    chainId: [1,56], // Ethereum Mainnet
                    logo: "https://s2.coinmarketcap.com/static/img/coins/200x200/825.png",
                    status: "ACTIVE"
                }
              
            ];

            const createdTokens = await tokenList.insertMany(tokens);
            console.log("Tokens Created 😀 ", createdTokens);

            // Get chains to update their token lists
            const chains = await ChainList.find({ chainId: { $in: tokens.map(t => t.chainId) } });

            for (const chain of chains) {
                const chainTokens = tokens.filter(t => t.chainId === chain.chainId);
                chain.tokens = chain.tokens.concat(chainTokens.map(t => t._id));
                await chain.save();
            }

            console.log("Chain lists updated with tokens 😀");

        }
    } catch (error) {
        console.log("Admin error===>>", error);
    }
}).call();