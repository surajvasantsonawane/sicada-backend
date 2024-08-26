import ChainList from './chainList';

import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const tokenContractSchema = new mongoose.Schema(
    {
        id: { type: String, required: true }, // Name of the token
        name: { type: String, required: true }, // Name of the token
        symbol: { type: String, required: true }, // Symbol of the token
        logo: { type: String, required: true },
        type: { type: String, required: true },
        contractAddress: { type: String, required: true }, // Contract address of the token on the chain
        decimals: { type: Number, required: true }, // Decimals of the token
        chainId: { type: Number, required: true }, // Chain ID where the token is deployed
    },
    {
        collection: 'tokensContractAddress',
        timestamps: true,
    }
);

tokenContractSchema.plugin(mongoosePaginate);
tokenContractSchema.plugin(mongooseAggregatePaginate);


const tokenList = mongoose.model('tokensContractAddress', tokenContractSchema);

export default tokenList;

 
(async () => {
    try {
        const result = await mongoose.model("tokensContractAddress", tokenContractSchema).find();
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