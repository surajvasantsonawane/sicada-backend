import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const chainListSchema = new mongoose.Schema(
    {
        chain: { type: String, required: true },
        chainId: { type: Number, required: true },
        network: { type: String, required: true }, // e.g., mainnet, testnet
        symbol: { type: String }, // e.g., ETH, BTC
        nativeCurrency: {
            name: { type: String }, // Name of the native currency
            symbol: { type: String }, // Symbol of the native currency
            decimals: { type: Number } // Decimals of the native currency
        },
        rpcUrls: [String], // Array of RPC URLs
        blockExplorerUrls: [String], // Array of Block Explorer URLs
        tokens: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tokens' }] // Reference to Token documents
    },
    {
        collection: 'chain_list',
        timestamps: true,
    }
);

chainListSchema.plugin(mongoosePaginate);
chainListSchema.plugin(mongooseAggregatePaginate);

const ChainList = mongoose.model('chain_list', chainListSchema);

export default ChainList;


(async () => {
    try {
        const result = await mongoose.model("chain_list", chainListSchema).find();
        if (result.length != 0) {
            console.log("Chain List 😀.");
        } else {
            const defaultData = [
                {
                    chain: 'Ethereum',
                    chainId: 1,
                    network: 'mainnet',
                    symbol: 'ETH',
                    nativeCurrency: {
                        name: 'Ether',
                        symbol: 'ETH',
                        decimals: 18,
                    },
                    rpcUrls: ['https://mainnet.infura.io/v3/e3b003a0230f45c3b308a968dc56e246'],
                    blockExplorerUrls: ['https://etherscan.io']
                },
                {
                    chain: 'Binance Smart Chain',
                    chainId: 56,
                    network: 'mainnet',
                    symbol: 'BNB',
                    nativeCurrency: {
                        name: 'Binance Coin',
                        symbol: 'BNB',
                        decimals: 18,
                    },
                    rpcUrls: ['https://bsc-dataseed.binance.org/'],
                    blockExplorerUrls: ['https://bscscan.com']
                }
            ];
            const createdRes = await mongoose.model("chain_list", chainListSchema).insertMany(defaultData);
            if (createdRes) {
                console.log("Chain List Created 😀 ", createdRes);
            }
        }
    } catch (error) {
        console.log("Admin error===>>", error);
    }
}).call();