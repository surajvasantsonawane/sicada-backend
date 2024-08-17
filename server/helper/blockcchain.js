const config = require("config");
const axios = require("axios");
const chromescandetails = config.get("chromescan")
const RPC_URL = chromescandetails.RPC_URL;
const contract = chromescandetails.tokenAddress;
const privateKey = chromescandetails.adminPrivateKey;
const contractABI = chromescandetails.abi;

const Web3 = require("web3");
const ethers = require('ethers');
const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));

exports.transferToken = async (toWalletAddress, amount) => {
    const cscPrice = await getCSCValue();

    const myContract = new web3.eth.Contract(contractABI, contract);
    const decimals = await myContract.methods.decimals().call()
    const balance = ethers.utils.parseUnits((amount * cscPrice).toString(), decimals);
    const Data = await myContract.methods.transfer(toWalletAddress, balance.toString()).encodeABI();
    const rawTransaction = {
        to: toWalletAddress,
        gasPrice: 150000000000, // Always in Wei (30 gwei)
        gasLimit: 800000, // Always in Wei
        value : balance,
        data: "0x" // Setting the pid 12 with 0 alloc and 0 deposit fee
    };

    const signPromise = await web3.eth.accounts.signTransaction(rawTransaction, privateKey.toString());
    let data = await web3.eth.sendSignedTransaction(signPromise.rawTransaction)
    return data;
}


exports.getTransactionsDetails = async (txHash) => {
    const receipt = await web3.eth.getTransactionReceipt(txHash);

    const transaction = await web3.eth.getTransaction(txHash)
    if (transaction) {
        const toAddress = transaction.to.toLowerCase();

        if (toAddress === contract.toLowerCase()) {
            // It's a token transfer; now, extract the value
            const input = transaction.input;

            // Parse the input data to get the function signature (method ID)
            const methodId = input.slice(0, 10);

            // Check if it's the transfer function (ERC-20 transfer)
            if (methodId === '0xa9059cbb') {
                // Extract the recipient and value from the input data
                const recipient = '0x' + input.slice(34, 74);
                const value = web3.utils.toBN('0x' + input.slice(74));

                console.log('Recipient: ', transaction);
                const ethAmount = web3.utils.fromWei(value.toString(), 'ether');
                console.log('ethAmount: ' + ethAmount);
                return { ethAmount, status: receipt.status }
            }
        } else {
            console.log('This transaction is not a token transfer.');
        }
    }
}

const getCSCValue = async () => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://dashboard.cccmining.org/api/tenant/b164ff9b-47d2-4b22-b3ec-3d0c69973188/exchange-rate?limit=1&api_key=79c9feda-7d18-47ee-bd82-c6e6f2221558-3cfe0363-352e-4e54-b1a9-5e9db7b0c89f',
        headers: { }
      };
      
      const result = await axios.request(config)
      .then((response) => {
        return response.data.rows[0].valueInUSD;
      })
      .catch((error) => {
        console.log(error);
      });

      return result;    
}


// getTransactionsDetails("0x7877a6cd1935bd6ea98f4b0434237bd4e852bed665e1c5babdd50842e48faba5", "0xe9D44FF86e4CD020ba2944DF45c60Dbd8D8D0e4a")
// module.exports.getTransactionsDetails("0x7877a6cd1935bd6ea98f4b0434237bd4e852bed665e1c5babdd50842e48faba5");

// transferToken("0xE9C94561f87C3bDDEAf59A8eD008f1f4F2cd762c", "0.1")