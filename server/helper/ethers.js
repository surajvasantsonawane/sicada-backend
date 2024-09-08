const axios = require('axios');
const { ethers } = require('ethers');

/**
 * Get USDT balance for a specific address on a given network.
 *
 * @param {string} network - The JSON RPC URL for the network (e.g., Ethereum, Binance Smart Chain).
 * @param {string} address - The address to check the balance for.
 * @param {string} contractAddress - The USDT contract address on the given network.
 * @returns {Promise<string>} The USDT balance formatted to 6 decimal places.
 */
exports.getBalance = async (network, address, contractAddress) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider(network); // Corrected class name
        const contract = new ethers.Contract(contractAddress, ['function balanceOf(address owner) view returns (uint256)'], provider);
        const balance = await contract.balanceOf(address);
        return ethers.utils.formatUnits(balance, 6); // USDT uses 6 decimals
    } catch (error) {
        console.error('Error getting USDT balance:', error);
        throw error;
    }
}

/**
 * Get the current price of USDT in USD.
 *
 * @param {string} ids - The CoinGecko IDs for the token (e.g., 'tether').
 * @param {string} vs_currencies - The currency to compare against (e.g., 'usd').
 * @returns {Promise<number>} The current price of USDT in USD.
 */
exports.getConversionPrice = async (ids, vs_currencies) => {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}`);
        return response.data[ids][vs_currencies]; // Dynamic access based on IDs and vs_currencies
    } catch (error) {
        console.error('Error getting USDT price:', error);
        throw error;
    }
}

/**
 * Calculate profit or loss based on price changes.
 *
 * @param {number} todayPrice - The current price of the token.
 * @param {number} yesterdayPrice - The price of the token from the previous day.
 * @param {number} amount - The amount of the token to calculate profit/loss for.
 * @returns {number} The profit or loss.
 */
exports.calculateProfitLoss = async (todayPrice, yesterdayPrice, amount) => {
    if (todayPrice === undefined || yesterdayPrice === undefined || amount === undefined) {
        throw new Error('All parameters are required');
    }
    const profitLoss = (todayPrice - yesterdayPrice) * amount;
    return Number(profitLoss, 8).toFixed(6);
}

exports.getTransactionStatus = async(network, txHash) => {
    const provider = new ethers.providers.JsonRpcProvider(network);

    // Fetch the transaction receipt
    const txReceipt = await provider.getTransactionReceipt(txHash);

    if (txReceipt === null) {
        return 'Pending';
    } else if (txReceipt.status === 1) {
        return 'Successful';
    } else if (txReceipt.status === 0) {
        return 'Failed';
    } else {
        return 'Unknown';
    }
}

exports.getTransactions = async (network, address, contractAddress) => {
    const provider = new ethers.providers.JsonRpcProvider(network);
    const contract = new ethers.Contract(contractAddress, ['event Transfer(address indexed from, address indexed to, uint256 value)'], provider);

    // Fetch logs for Transfer events
    const filter = contract.filters.Transfer(address);
    const logs = await provider.getLogs({
        ...filter,
        fromBlock: 0, // Adjust the block range as needed
        toBlock: 'latest',
    });

    // Decode logs
    const transactions = logs.map(log => {
        const parsedLog = contract.interface.parseLog(log);
        return {
            from: parsedLog.args.from,
            to: parsedLog.args.to,
            value: ethers.utils.formatUnits(parsedLog.args.value, 6), // USDT has 6 decimals
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
        };
    });

    return transactions;
}