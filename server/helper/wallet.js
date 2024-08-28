const ethWallet = require('ethereumjs-wallet');
const ethers = require("ethers"); 
const elliptic = require('elliptic');
const baseX = require('base-x');
const crypto = require("crypto");

const bs58check = require('bs58check');

const EC = elliptic.ec;
const ec = new EC('secp256k1');


// Define Base58 encoding alphabet for TRON addresses
const base58 = baseX.default('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');

// Create a function to generate TRON address from private key
function privateKeyToTronAddress(privateKey) {
// Convert the private key from hex to a Buffer
const privateKeyBuffer = Buffer.from(privateKey, 'hex');

// Generate the public key from the private key
const keyPair = ec.keyFromPrivate(privateKeyBuffer);
const publicKeyBuffer = Buffer.from(keyPair.getPublic(true, 'bytes'));

// Perform SHA256 hash on the public key
const sha256Hash = crypto.createHash('sha256').update(publicKeyBuffer).digest();

// Perform RIPEMD160 hash on the SHA256 hash
const ripemd160Hash = crypto.createHash('ripemd160').update(sha256Hash).digest();

// Add version byte (0x41 for TRON mainnet)
const versionedRipemd160Hash = Buffer.concat([Buffer.from([0x41]), ripemd160Hash]);

// Perform SHA256 twice
const checksum = crypto.createHash('sha256').update(
    crypto.createHash('sha256').update(versionedRipemd160Hash).digest()
).digest().slice(0, 4);

// Concatenate versioned ripemd160 hash with checksum
const addressBytes = Buffer.concat([versionedRipemd160Hash, checksum]);

// Encode the result in Base58
const address = base58.encode(addressBytes);

return address;
}

// Function to generate wallet based on blockchain type
exports.generateWallet = async (blockchainType) => {
    if (blockchainType === 'EVM_Based') {
        // Generate a new wallet only if the user doesn't have an EVM-based address
        const wallet = ethers.Wallet.createRandom();
        const privateKey = wallet.privateKey;
        const publicKey = wallet.address;
        return { publicKey, privateKey };
    } 
    else if (blockchainType === 'TRON_Based') {
        // Generate a new wallet for TRON-based chains
        const privateKey = crypto.randomBytes(32).toString('hex');
        console.log("privateKey: ", privateKey);
        
        const tronAddress = privateKeyToTronAddress(privateKey);
        return { publicKey: tronAddress, privateKey };
    } 
    else {
        throw new Error("Unsupported blockchain type. Use 'EVM_Based' or 'TRON_Based'.");
    }
}
