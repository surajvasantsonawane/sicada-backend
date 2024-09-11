require('dotenv').config();
const crypto = require('crypto');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');


// Function to generate the signature, incorporating the provided logic
function generateSignature(secretKey, timestamp, method, url) {
  // Create HMAC-SHA256 signature with secretKey
  const signatureString = `${timestamp}${method.toUpperCase()}${url}`;
  console.log(`Signature String: ${signatureString}`); // Log the signature string
  const signature = crypto.createHmac('sha256', secretKey)
                          .update(signatureString)
                          .digest('hex');
  console.log(`Generated Signature: ${signature}`); // Log the generated signature
  return signature;
}

// Function to generate HMAC-SHA256 signature
function generateSignatureFromData(secretKey, timestamp, method, url, data) {
  // Create HMAC-SHA256 signature with secretKey
  const signature = crypto.createHmac('sha256', secretKey);
  
  // Append timestamp, method, and URL to the signature
  signature.update(`${timestamp}${method.toUpperCase()}${url}`);

  // If data is provided (but not multipart), update the signature with it
  if (data && !(data instanceof FormData)) {
    signature.update(data);
  }

  // Return the signature as a hex string
  return signature.digest('hex');
}

// Service function to create an applicant in Sumsub
exports.createApplicant = async (externalUserId, email, phone) => {
  const secretKey = 'bKou2C8QQCuKhRz7KIT1hWh8kudm6Bej'; // Replace with your actual secret key
  const appToken = 'sbx:c17SmjLOJwPzg9CkFDqoMlWx.N8AJ06n3aqGuNik2RJKW9K3hY1X5GdEz';
  const method = 'POST';
  const url = '/resources/applicants?levelName=basic-kyc-level';
  const body = JSON.stringify({ externalUserId });

  const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds

  // Generate the signature
  const signature = generateSignature(secretKey, timestamp, method, url, body);

  // Define the options for the fetch request
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-App-Token': appToken,
      'X-App-Access-Sig': signature,
      'X-App-Access-Ts': timestamp
    },
    body: body
  };

  // Call the API
  try {
    const response = await fetch('https://api.sumsub.com' + url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Error: ${data.message || 'Unknown error'}`);
    }

    return data; // Return the data on success
  } catch (error) {
    console.error('Error creating applicant:', error.message);
    throw error; // Propagate the error
  }
};

// Service function to create an applicant in Sumsub
exports.getApplicantStatus = async (applicantId) => {
  const secretKey = 'bKou2C8QQCuKhRz7KIT1hWh8kudm6Bej'; // Replace with your actual secret key
  const appToken = 'sbx:c17SmjLOJwPzg9CkFDqoMlWx.N8AJ06n3aqGuNik2RJKW9K3hY1X5GdEz';
  const method = 'GET';  // Change to GET
  const url = '/resources/applicants/' + applicantId + '/requiredIdDocsStatus';

  // Current timestamp in seconds
  const timestamp = Math.floor(Date.now() / 1000);

  // Generate the signature
  const signature = generateSignature(secretKey, timestamp, method, url, '');

  // Define the options for the fetch request
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'X-App-Token': appToken,
      'X-App-Access-Sig': signature,
      'X-App-Access-Ts': timestamp
    },
  };

  // Call the API
  try {
    const response = await fetch('https://api.sumsub.com' + url, options);
    const data = await response.json();

    // Log the full response for debugging
    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(`Error: ${data.description || 'Unknown error'} (code: ${data.code})`);
    }

    return data; // Return the data on success
  } catch (error) {
    console.error('Error getting applicant status:', error.message);
    throw error; // Propagate the error
  }
};

// Service function to create an applicant in Sumsub
exports.addIdDocument = async (applicantId, idDocType, country, filepath) => {
  const secretKey = 'bKou2C8QQCuKhRz7KIT1hWh8kudm6Bej'; // Replace with your actual secret key
  const appToken = 'sbx:c17SmjLOJwPzg9CkFDqoMlWx.N8AJ06n3aqGuNik2RJKW9K3hY1X5GdEz'; // Replace with your actual app token
  const method = 'POST';
  const url = `/resources/applicants/${applicantId}/info/idDoc`;

  // Current timestamp in seconds
  const timestamp = Math.floor(Date.now() / 1000);

  // Create the form data
  const form = new FormData();
  form.append('idDocType', idDocType); // Document type (e.g. "PASSPORT")
  form.append('country', country);     // Country code (e.g. "US")
  form.append('content', fs.createReadStream(filepath)); // Attach the file

  // Generate the signature (with empty body for file upload)
  const signature = generateSignature(secretKey, timestamp, method, url);

  // Define the options for the fetch request
  const options = {
    method: 'POST',
    headers: {
      ...form.getHeaders(),
      'X-App-Token': appToken,
      'X-App-Access-Sig': signature,
      'X-App-Access-Ts': timestamp.toString(),
      'X-Return-Doc-Warnings': 'true'
    },
    body: form
  };

  // Call the API
  try {
    const response = await fetch('https://api.sumsub.com' + url, options);
    const data = await response.json();

    if (!response.ok) {
      console.log("data: " + JSON.stringify(data));
      
      throw new Error(`Error: ${data.description || 'Unknown error'} (code: ${data.code})`);
    }

    return data; // Return the data on success
  } catch (error) {
    console.error('Error uploading ID document:', error);
    throw error; // Propagate the error
  }
};
