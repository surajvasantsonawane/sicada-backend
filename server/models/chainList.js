import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const chainListSchema = new mongoose.Schema(
    {
        chain: { type: String, required: true },
        chainId: { type: Number, required: true },
        networkType: { type: String, required: true }, // 'mainnet' or 'testnet'
        symbol: { type: String }, // e.g., ETH, BTC
        nativeCurrency: {
            name: { type: String }, // Name of the native currency
            symbol: { type: String }, // Symbol of the native currency
            decimals: { type: Number } // Decimals of the native currency
        },
        blockchainType: { type: String },
        tokenStandard: { type: String }, // e.g., ERC20, BEP20, TRC20
        baseType: { type: String }, // e.g., Ethereum-based, Tron-based
        testnetName: { type: String }, // Specific testnet names like Shasta, Goerli
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
            console.log("Chain List already exists 😀.");
        } else {
            const defaultData = [
                // Ethereum
                {
                    chain: 'Ethereum',
                    chainId: 1,
                    networkType: 'mainnet',
                    symbol: 'ETH',
                    blockchainType: 'EVM_Based',
                    nativeCurrency: {
                        name: 'Ether',
                        symbol: 'ETH',
                        decimals: 18,
                    },
                    tokenStandard: 'ERC20',
                    baseType: 'Ethereum-based',
                    rpcUrls: ['https://mainnet.infura.io/v3/e3b003a0230f45c3b308a968dc56e246'],
                    blockExplorerUrls: ['https://etherscan.io']
                },
                {
                    chain: 'Ethereum',
                    chainId: 5, // Goerli Testnet
                    networkType: 'testnet',
                    testnetName: 'Goerli',
                    symbol: 'ETH',
                    blockchainType: 'EVM_Based',
                    nativeCurrency: {
                        name: 'Ether',
                        symbol: 'ETH',
                        decimals: 18,
                    },
                    tokenStandard: 'ERC20',
                    baseType: 'Ethereum-based',
                    rpcUrls: ['https://goerli.infura.io/v3/e3b003a0230f45c3b308a968dc56e246'],
                    blockExplorerUrls: ['https://goerli.etherscan.io']
                },

                // Binance Smart Chain
                {
                    chain: 'Binance Smart Chain',
                    chainId: 56,
                    networkType: 'mainnet',
                    symbol: 'BNB',
                    blockchainType: 'EVM_Based',
                    nativeCurrency: {
                        name: 'Binance Coin',
                        symbol: 'BNB',
                        decimals: 18,
                    },
                    tokenStandard: 'BEP20',
                    baseType: 'Ethereum-based',
                    rpcUrls: ['https://bsc-dataseed.binance.org/'],
                    blockExplorerUrls: ['https://bscscan.com']
                },
                {
                    chain: 'Binance Smart Chain',
                    chainId: 97,
                    networkType: 'testnet',
                    symbol: 'BNB',
                    blockchainType: 'EVM_Based',
                    nativeCurrency: {
                        name: 'Binance Coin',
                        symbol: 'BNB',
                        decimals: 18,
                    },
                    tokenStandard: 'BEP20',
                    baseType: 'Ethereum-based',
                    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                    blockExplorerUrls: ['https://testnet.bscscan.com']
                },

                // Polygon
                {
                    chain: 'Polygon',
                    chainId: 137,
                    networkType: 'mainnet',
                    symbol: 'MATIC',
                    blockchainType: 'EVM_Based',
                    nativeCurrency: {
                        name: 'Matic',
                        symbol: 'MATIC',
                        decimals: 18,
                    },
                    tokenStandard: 'ERC20',
                    baseType: 'Ethereum-based',
                    rpcUrls: ['https://polygon-rpc.com/'],
                    blockExplorerUrls: ['https://polygonscan.com']
                },
                {
                    chain: 'Polygon',
                    chainId: 80001, // Mumbai Testnet
                    networkType: 'testnet',
                    symbol: 'MATIC',
                    blockchainType: 'EVM_Based',
                    nativeCurrency: {
                        name: 'Matic',
                        symbol: 'MATIC',
                        decimals: 18,
                    },
                    tokenStandard: 'ERC20',
                    baseType: 'Ethereum-based',
                    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                    blockExplorerUrls: ['https://mumbai.polygonscan.com']
                },

                // Tron
                {
                    chain: 'Tron',
                    chainId: 195,
                    networkType: 'mainnet',
                    symbol: 'TRX',
                    blockchainType: 'TRON_Based',
                    nativeCurrency: {
                        name: 'Tron',
                        symbol: 'TRX',
                        decimals: 18,
                    },
                    tokenStandard: 'TRC20',
                    baseType: 'Tron-based',
                    rpcUrls: ['https://api.trongrid.io/'],
                    blockExplorerUrls: ['https://tronscan.org']
                },
                {
                    chain: 'Tron',
                    chainId: 197, // Shasta Testnet
                    networkType: 'testnet',
                    testnetName: 'Shasta',
                    symbol: 'TRX',
                    blockchainType: 'TRON_Based',
                    nativeCurrency: {
                        name: 'Tron',
                        symbol: 'TRX',
                        decimals: 18,
                    },
                    tokenStandard: 'TRC20',
                    baseType: 'Tron-based',
                    rpcUrls: ['https://api.shasta.trongrid.io/'],
                    blockExplorerUrls: ['https://shasta.tronscan.org']
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
