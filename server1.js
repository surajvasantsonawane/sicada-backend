const crypto = require('crypto');

const algorithm = 'aes-256-cbc';

// Replace this with your actual 32-byte key in hex format
const keyHex = '2b7e151628aed2a6abf7158809cf4f3c76f4b8a905fcd9b5d8a4b40e41a74e60'; // Example: '0000000000000000000000000000000000000000000000000000000000000000'
const key = Buffer.from(keyHex, 'hex');

// Ensure the key is 32 bytes long
if (key.length !== 32) {
  throw new Error('The key must be 32 bytes long.');
}

function getIV() {
  return crypto.randomBytes(16);
}

function encrypt(text) {
  const iv = getIV();
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(encryptedData, iv) {
  const ivBuffer = Buffer.from(iv, 'hex');
  const encryptedText = Buffer.from(encryptedData, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const main = (text) => {
  const { iv, encryptedData } = encrypt(text);
  console.log("IV:", iv);
  console.log("Encrypted Data:", encryptedData);

  const decryptedData = decrypt(encryptedData, iv);
  console.log("Decrypted Data:", decryptedData);
}

// Example usage
main("my private");
