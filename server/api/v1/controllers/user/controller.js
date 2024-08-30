import Joi, { link } from "joi";
const { ethers } = require('ethers');

import _ from "lodash";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import status from "../../../../enums/status";
import userType from "../../../../enums/userType";
import cryptoFunction from "../../../../helper/encryptionKey";
import walletFunction from "../../../../helper/wallet";



const QRCode = require('qrcode');
async function generateQRCode(address) {
  try {
    const qrCodeData = await QRCode.toDataURL(address);
    return qrCodeData;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}
// Example conversion function used in the API
function convertUSDToDollars(usdAmount) {
  return usdAmount.toFixed(2);
}

import { userServices } from "../../services/user";
const { createUser, findUser, updateUser, emailMobileExist } = userServices;


import { userWalletServices } from "../../services/user_wallets";
const { upsertUserWallet, createUserWallet, updateUserWallet, insertManyUserWallet } = userWalletServices;


import { chainListServices } from "../../services/chain_list";
const { findChainList, findChain } = chainListServices;

import { currencyServices } from "../../services/currency";
const { findCurrency, findSingleCurrency } = currencyServices;

import { userTokenWalletServices } from "../../services/user_token_wallet";
const { createUserTokenWallet, findUserWallet, upsertUserTokenWallet } = userTokenWalletServices;


import { tokenServices } from "../../services/token";
const { aggregateTokens, findListTokens, findToken } = tokenServices;


import { depositeWalletServices } from "../../services/deposite_wallet_address";
const { findDepositWallets } = depositeWalletServices;

import { cryptoTransactionServices } from "../../services/cryptoTransaction";
const { createCryptoTransactions, updateCryptoTransactions } = cryptoTransactionServices;


export class userController {

  /**
   * @swagger
   * /user/register:
   *   post:
   *     tags:
   *       - USER
   *     summary: Register a new user
   *     description: Registers a new user with the provided information.
   *     parameters:
   *       - name: register
   *         description: register
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/register'
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async register(req, res, next) {
    // Define the validation schema using Joi
    const validationSchema = Joi.object({
      name: Joi.string().required(), // Name is required and must be a string
      email: Joi.string().email().required(), // Email is required and must be a valid email format
      accountType: Joi.string().valid('CORPORATE', 'INDIVIDUAL').required(), // Account type must be either 'CORPORATE' or 'INDIVIDUAL'
      countryCode: Joi.string()
        .pattern(/^\+\d{1,3}$/) // Ensures country code format like +1, +91, etc.
        .required()
        .messages({
          'string.pattern.base': 'Country code must be in the format +[country code]',
          'string.empty': 'Country code is required',
          'any.required': 'Country code is required'
        }),
      mobile: Joi.number()
        .integer() // Mobile number must be an integer
        .min(1000000000) // Ensures the mobile number is exactly 10 digits (min value for 10-digit number)
        .max(9999999999) // Ensures the mobile number is exactly 10 digits (max value for 10-digit number)
        .required()
        .messages({
          'number.base': 'Mobile number must be a number',
          'number.min': 'Mobile number must be exactly 10 digits',
          'number.max': 'Mobile number must be exactly 10 digits',
          'number.empty': 'Mobile number is required',
          'any.required': 'Mobile number is required'
        })
    });

    try {
      // Convert email to lowercase to ensure case-insensitive uniqueness
      if (req.body.email) req.body.email = req.body.email.toLowerCase();

      // Validate the request body against the schema
      const { error, value } = validationSchema.validate(req.body);
      if (error) {
        // If validation fails, return a 400 error with the validation message
        return res.status(400).json({ error: error.details[0].message });
      }

      // Destructure the validated values
      const { name, email, mobile, accountType, countryCode } = value;

      // Check if the email or mobile number already exists in the database
      let userInfo = await emailMobileExist(mobile, email);
      if (userInfo && userInfo.isAccountCreated) {
        // If the account already exists and email or mobile is found, return the appropriate error
        if (userInfo.email == email) {
          throw apiError.forbidden(responseMessage.EMAIL_EXIST);
        } else {
          throw apiError.forbidden(responseMessage.MOBILE_EXIST);
        }
      }

      if (userInfo && (userInfo.email != email || userInfo.mobileNumber != mobile)) {
        // If the account is found but email or mobile doesn't match, return the appropriate error
        if (userInfo.email == email) {
          throw apiError.forbidden(responseMessage.EMAIL_EXIST);
        } else {
          throw apiError.forbidden(responseMessage.MOBILE_EXIST);
        }
      }

      if (!userInfo) {
        // If no account is found, create a new user
        // Hash the password using bcrypt

        const newUser = {
          name,
          email,
          mobileNumber: mobile,
          countryCode,
          accountType,
          otpVerification: false // Set OTP verification to false initially
        };

        // Create the user in the database
        userInfo = await createUser(newUser);
        console.log("🚀 ~ userController ~ register ~ userInfo:", userInfo)
      }

      // Generate OTP for email and mobile
      const otp = {
        email: commonFunction.getOTP(),
        mobile: commonFunction.getOTP(),
      };
      console.log("🚀 ~ userController ~ register ~ otp:", otp)
      // Set OTP expiration time (e.g., 3 minutes from now)
      const otpExpireTime = {
        email: new Date().getTime() + 180000,
        mobile: new Date().getTime() + 180000,
      };

      // Optionally send OTP via email
      // await commonFunction.sendMailOtpNodeMailer(email, otp);

      // Optionally send OTP via mobile number

      // Update user with generated OTP and expiration time
      await updateUser(
        { _id: userInfo._id },
        { otp, otpExpireTime }
      );

      // Prepare response object with essential user details
      const responseObj = {
        _id: userInfo._id,
        email: userInfo.email,
        otp: otp
      };
      // Respond with the created user and success message
      return res.status(201).json(new response(responseObj, responseMessage.OTP_SEND));
    } catch (error) {
      // Log and pass any errors to the global error handler
      console.error(error);
      return next(error);
    }
  }

  /**
  * @swagger
  * /user/verifyOTP/{userId}:
  *   post:
  *     tags:
  *       - USER
  *     summary: Verify otp send on your email and registered mobile number
  *     description: verifyOTP after signUp to verified User on Platform
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: userId
  *         description: User Id
  *         in: path
  *         required: true
  *       - name: verifyOTP
  *         description: verifyOTP
  *         in: body
  *         required: true
  *         schema:
  *           $ref: '#/definitions/verifyOTP'
  *     responses:
  *       200:
  *         description: Returns success message
  */

  async verifyOTP(req, res, next) {
    // Define validation schema for incoming request using Joi
    const validationSchema = Joi.object({
      email_otp: Joi.number().required(),   // Email OTP must be a number and is required
      mobile_otp: Joi.number().required(),  // Mobile OTP must be a number and is required
      userId: Joi.string().required(),      // User ID must be a string and is required
    });

    try {
      // Extract userId from request parameters
      const { userId } = req.params;

      // Validate the request body and userId against the schema
      const { error, value } = validationSchema.validate({ ...req.body, userId: userId });
      if (error) {
        // Throw error if validation fails
        throw apiError.badRequest(error.details[0].message);
      }

      // Find the user by userId
      const userResult = await findUser({ _id: userId });
      if (!userResult) {
        // Throw error if the user is not found
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const { mobile_otp, email_otp } = value;

      // Check if email OTP has expired
      if (new Date().getTime() > userResult.otpExpireTime.email) {
        throw apiError.badRequest(responseMessage.OTP_EMAIL_EXPIRED);
      }

      // Check if mobile OTP has expired
      if (new Date().getTime() > userResult.otpExpireTime.mobile) {
        throw apiError.badRequest(responseMessage.OTP_MOBILE_EXPIRED);
      }

      // Check if the provided email OTP matches the stored email OTP
      if (userResult.otp.email !== email_otp) {
        throw apiError.badRequest(responseMessage.INCORRECT_EMAIL_OTP);
      }

      // Check if the provided mobile OTP matches the stored mobile OTP
      if (userResult.otp.mobile !== mobile_otp) {
        throw apiError.badRequest(responseMessage.INCORRECT_MOBILE_OTP);
      }

      // Update the user's OTP verification status and account creation status
      const updateResult = await updateUser(
        { _id: userResult._id },
        { 'otpVerification.email': true, 'otpVerification.mobile': true, isAccountCreated: true }
      );

      // Generate authentication token for the user
      const token = await commonFunction.getToken({
        id: userResult._id,              // User ID
        email: userResult.email,          // User email
        userType: userResult.userType,    // User type
      });

      // Prepare the response object with the updated information
      const responseObj = {
        _id: updateResult._id,
        otpVerification: true,
        token: token
      };

      // Send the response back to the client
      return res.json(new response(responseObj, responseMessage.OTP_VERIFY));
    } catch (error) {
      console.log(error);
      // Forward any errors to the error handler
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/login:
   *   post:
   *     tags:
   *       - USER
   *     summary: Login using registered Email and Password
   *     description: login with email and password
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: login
   *         description: login
   *         in: body
   *         required: false
   *         schema:
   *           $ref: '#/definitions/login'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async login(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().email().allow("").optional(), // Email is optional but must be valid if provided
      mobile: Joi.string().pattern(/^[0-9]{10}$/).optional(), // Mobile is optional but must be a valid 10-digit number if provided
    });

    try {

      // Convert email to lowercase to ensure case-insensitive uniqueness
      if (req.body.email) req.body.email = req.body.email.toLowerCase();

      // Validate the request body against the schema
      const { error, value } = validationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email, mobile } = value;

      // Check if either email or mobile is provided
      if (!email && !mobile) {
        return res.status(400).json({ error: 'Either email or mobile must be provided.' });
      }

      // Check if the user exists in the database based on email or mobile
      let userInfo = await emailMobileExist(mobile, email);
      if (!userInfo) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // Check account creation and status
      if (!userInfo.isAccountCreated) {
        throw apiError.forbidden(responseMessage.ACCOUNT_NOT_CREATED);
      }
      if (userInfo.status === status.BLOCK) {
        throw apiError.forbidden({ status: userInfo.status, message: responseMessage.USER_BLOCKED });
      }

      // Initialize OTP-related data
      const otpExpireTime = new Date().getTime() + 180000; // 3 minutes
      const otpData = {};
      const otpVerificationUpdate = {};

      if (email) {
        otpData['otp.email'] = commonFunction.getOTP(); // Generate OTP for email
        otpData['otpExpireTime.email'] = otpExpireTime;
        otpVerificationUpdate['otpVerification.email'] = false;
        // Uncomment and ensure the sendMailOtpNodeMailer function is implemented correctly
        // await commonFunction.sendMailOtpNodeMailer(email, otpData['otp.email']);
      }

      if (mobile) {
        otpData['otp.mobile'] = commonFunction.getOTP(); // Generate OTP for mobile
        otpData['otpExpireTime.mobile'] = otpExpireTime;
        otpVerificationUpdate['otpVerification.mobile'] = false;
        // Uncomment and ensure the sendMobileOtp function is implemented correctly
        // await commonFunction.sendMobileOtp(mobile, otpData['otp.mobile']);
      }
      console.log(otpData, 101)
      // Update user with OTP and expiration details
      await updateUser({ _id: userInfo._id }, { ...otpData, ...otpVerificationUpdate });

      const responseObj = {
        _id: userInfo._id,
        type: email ? 'email' : 'mobile',
        otpData: otpData
      };

      // Send response
      return res.json(new response(responseObj, responseMessage.OTP_SEND));
    } catch (error) {
      // Use a logging library for better error handling in production
      console.error(error);
      return next(error);
    }
  }

  /**
 * @swagger
 * /user/verifySingleOTP/{userId}:
 *   post:
 *     tags:
 *       - USER
 *     summary: Verify otp send on your email and registered mobile number
 *     description: verifySingleOTP after signUp to verified User on Platform
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: User Id
 *         in: path
 *         required: true
 *       - name: verifySingleOTP
 *         description: verifySingleOTP
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/verifySingleOTP'
 *     responses:
 *       200:
 *         description: Returns success message
 */
  async verifySingleOTP(req, res, next) {
    // Define validation schema for incoming request using Joi
    const validationSchema = Joi.object({
      type: Joi.string().valid('email', 'mobile').required(), // Type must be 'email' or 'mobile'
      otp: Joi.number().optional(),
      userId: Joi.string().required(),
    });

    try {
      // Extract type and userId from request parameters
      const { userId } = req.params;

      // Validate the request body and userId against the schema
      const { error, value } = validationSchema.validate({ ...req.body, userId: userId });
      if (error) {
        // Throw error if validation fails
        throw apiError.badRequest(error.details[0].message);
      }

      // Find the user by userId
      const userResult = await findUser({ _id: userId });
      if (!userResult) {
        // Throw error if the user is not found
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const { otp, type } = value;

      // Handle OTP verification based on type
      if (type == 'email') {
        // Check if email OTP has expired
        if (new Date().getTime() > userResult.otpExpireTime.email) {
          throw apiError.badRequest(responseMessage.OTP_EMAIL_EXPIRED);
        }

        // Check if the provided email OTP matches the stored email OTP
        if (userResult.otp.email !== otp) {
          throw apiError.badRequest(responseMessage.INCORRECT_EMAIL_OTP);
        }

      } else if (type == 'mobile') {
        // Check if mobile OTP has expired
        if (new Date().getTime() > userResult.otpExpireTime.mobile) {
          throw apiError.badRequest(responseMessage.OTP_MOBILE_EXPIRED);
        }

        // Check if the provided mobile OTP matches the stored mobile OTP
        if (userResult.otp.mobile !== otp) {
          throw apiError.badRequest(responseMessage.INCORRECT_MOBILE_OTP);
        }
      } else {
        // If type is not 'email' or 'mobile', throw a bad request error
        throw apiError.badRequest(responseMessage.INVALID_OTP_TYPE);
      }

      // Update the user's OTP verification status and account creation status
      const updateObj = type ? { [`otpVerification.${type}`]: true } : {};
      const updateResult = await updateUser({ _id: userResult._id }, { $set: updateObj });

      // Generate authentication token for the user
      const token = await commonFunction.getToken({
        id: userResult._id,              // User ID
        userType: userResult.userType,    // User type
      });

      // Prepare the response object with the updated information
      const responseObj = {
        _id: updateResult._id,
        token: token
      };

      // Send the response back to the client
      return res.json(new response(responseObj, responseMessage.OTP_VERIFY));
    } catch (error) {
      console.log(error);
      // Forward any errors to the error handler
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/resendotp/{userId}:
   *   post:
   *     tags:
   *       - USER
   *     summary: Resend OTP to your registered email or mobile number
   *     description: resendOTP for User
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userId
   *         description: User Id
   *         in: path
   *         required: true
   *       - name: resendOTP
   *         description: resendOTP
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/resendOTP'
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async resendOTP(req, res, next) {
    // Define the validation schema for the incoming request
    const validationSchema = Joi.object({
      userId: Joi.string().required(), // userId is required and must be a string
      type: Joi.string().valid('email', 'mobile', 'both').required(), // type must be either 'email', 'mobile', or 'both'
    });

    try {
      // Validate the request body and extract the validated values
      const { error, value } = validationSchema.validate({
        ...req.body,
        userId: req.params.userId, // Include userId from the request parameters
      });

      // If validation fails, throw a bad request error with the validation message
      if (error) {
        throw apiError.badRequest(error.details[0].message);
      }

      // Destructure the validated values for easier access
      const { type, userId } = value;

      // Find the user in the database based on userId and account status
      const userResult = await findUser({
        _id: userId,
        status: { $ne: status.DELETE }, // Ensure the user is not deleted
      });

      // If the user is not found, throw a not found error
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // Calculate OTP expiration time (current time + 3 minutes)
      const otpExpireTime = new Date().getTime() + 180000; // 3 minutes
      const otpData = {}; // Initialize an object to hold OTP-related data

      // Handle OTP generation and sending based on the type
      if (type === 'email' || type === 'both') {
        otpData['otp.email'] = commonFunction.getOTP(); // Generate OTP for email
        otpData['otpExpireTime.email'] = otpExpireTime; // Set expiration time for email OTP
        otpData['otpVerification.email'] = false;
        // Send the email OTP (commented out)
        // await commonFunction.sendMailOtpNodeMailer(userResult.email, otpData['otp.email']);
      }

      if (type === 'mobile' || type === 'both') {
        otpData['otp.mobile'] = commonFunction.getOTP(); // Generate OTP for mobile
        otpData['otpExpireTime.mobile'] = otpExpireTime; // Set expiration time for mobile OTP
        otpData['otpVerification.mobile'] = false;
        // Send the mobile OTP (commented out)
        // await commonFunction.sendMobileOtp(otpData['otp.mobile']);
      }

      // Update the user with the new OTP and expiration time in the database
      await updateUser(
        { _id: userResult._id },
        otpData
      );

      // Respond with a success message and the userId
      return res.json(new response({ userId, type: type, otpData: otpData }, responseMessage.OTP_SEND));
    } catch (error) {
      // Log the error and pass it to the error handler
      console.error(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/fileUpload:
   *   post:
   *     tags:
   *       - USER
   *     summary: Upload files
   *     description: fileUpload for User
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: bankStatement
   *         description: fileUpload for User
   *         in: formData
   *         type: file
   *         required: true
   *       - name: gstCertificate
   *         description: fileUpload for User
   *         in: formData
   *         type: file
   *         required: false
   *       - name: certificateOfIncorporation
   *         description: fileUpload for User
   *         in: formData
   *         type: file
   *         required: false
   *       - name: EAOA
   *         description: fileUpload for User
   *         in: formData
   *         type: file
   *         required: false
   *       - name: EMOA
   *         description: fileUpload for User
   *         in: formData
   *         type: file
   *         required: false
   *       - name: sourceOfPayment
   *         description: sourceOfPayment
   *         enum: ["SALARY", "BUSINESS", "INVESTMENT", "SAVINGS", "OTHER"]
   *         in: formData
   *         required: false
   *       - name: p2pMerchant
   *         description: p2pMerchant for User
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async fileUploadCont(req, res, next) {
    // Define the validation schema
    let validationSchema = Joi.object({
      bankStatement: Joi.string().optional(),
      gstCertificate: Joi.string().optional(),
      certificateOfIncorporation: Joi.string().optional(),
      EAOA: Joi.string().optional(),
      EMOA: Joi.string().optional(),
      sourceOfPayment: Joi.string()
        .valid("SALARY", "BUSINESS", "INVESTMENT", "SAVINGS", "OTHER")
        .optional(),
      p2pMerchant: Joi.string().optional(),
    });

    try {
      // Fetch the user to check the accountType
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });

      // If user not found, throw an error
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // Validate the request body against the schema
      const { error, value } = validationSchema.validate(req.body);
      console.log(value, 100)

      // If validation fails, throw a bad request error with the validation message
      if (error) {
        throw apiError.badRequest(responseMessage.UPLOAD_ERROR);
      }

      // Generate URLs for all uploaded files
      let fileUrls = {
        bankStatement: null,
        gstCertificate: null,
        certificateOfIncorporation: null,
        EAOA: null,
        EMOA: null
      };

      // Process all uploaded files
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          console.log("file", file);

          if (file.fieldname.includes('bankStatement')) {
            fileUrls.bankStatement = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
          } else if (file.fieldname.includes('gstCertificate')) {
            fileUrls.gstCertificate = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
          } else if (file.fieldname.includes('certificateOfIncorporation')) {
            fileUrls.certificateOfIncorporation = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
          } else if (file.fieldname.includes('EAOA')) {
            fileUrls.EAOA = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
          } else if (file.fieldname.includes('EMOA')) {
            fileUrls.EMOA = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
          }
        });
      }
      console.log("fileUrls", fileUrls);

      // Create an object to store the URLs and optional fields for updating the user document
      let updateObj = { ...fileUrls, ...value };
      // Update the user's document with the new URL and optional fields
      await updateUser(
        { _id: userResult._id },
        { $set: updateObj }
      );

      // Return the response with the updated URL and other info
      return res.json(new response(updateObj, responseMessage.UPLOAD_SUCCESS));
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }

  /**
  * @swagger
  * /user/editProfile:
  *   put:
  *     tags:
  *       - USER
  *     summary: Update user profile
  *     description: Update Profile for a particular user.
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: token
  *         description: token
  *         in: header
  *         required: true
  *       - name: profile edit
  *         description: Parameters for editing the profile
  *         in: body
  *         required: false
  *         schema:
  *           $ref: '#/definitions/editProfile'
  *     responses:
  *       200:
  *         description: Returns success message
  */

  async editProfile(req, res, next) {
    try {
      // Find the user by ID and ensure they are not deleted
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // Define validation schemas with enhanced rules
      const individualSchema = Joi.object({
        panCardNumber: Joi.string()
          .length(10) // PAN card number should be 10 characters long
          .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/) // PAN card should match the pattern XXXXX9999X
          .optional(),
        aadhaarCardNumber: Joi.string()
          .length(12) // Aadhaar number should be 12 characters long
          .regex(/^\d{12}$/) // Aadhaar number should be numeric and 12 digits long
          .optional(),
      });

      const corporateSchema = Joi.object({
        panCardNumber: Joi.string()
          .length(10) // PAN card number should be 10 characters long
          .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/) // PAN card should match the pattern XXXXX9999X
          .optional(),
        aadhaarCardNumber: Joi.forbidden(), // Aadhaar card should not be present
      });

      // Choose the validation schema based on accountType
      let validationSchema;
      if (userResult.accountType === 'INDIVIDUAL') {
        validationSchema = individualSchema;
      } else if (userResult.accountType === 'CORPORATE') {
        validationSchema = corporateSchema;
      } else {
        throw apiError.badRequest(responseMessage.INVALID_ACCOUNT_TYPE);
      }

      // Validate the request body
      const validatedBody = await validationSchema.validateAsync(req.body);

      // Update the user with validated fields
      var result = await updateUser({ _id: userResult._id }, validatedBody);

      // Return a success response
      return res.json(new response({}, responseMessage.USER_UPDATED));
    } catch (error) {
      console.log("error", error);
      return next(error);
    }
  }

  /**
    * @swagger
    * /user/getProfile:
    *   get:
    *     summary: Get User Profile
    *     tags:
    *       - USER
    *     description: Retrieve details of the currently authenticated User's Profile.
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *     responses:
    *       200:
    *         description: Returns success message
    */

  async getProfile(req, res, next) {
    try {
      // Find the user by ID
      // This will search for the user in the database using the user ID provided in the request
      const userResult = await findUser({
        _id: req.userId,
      });

      // Log the user result for debugging purposes
      console.log(userResult, 100);

      // Check if the user was found
      // If no user is found with the provided ID, throw an error
      if (!userResult) {
        // Handle the case where the user is not found by throwing a 'Not Found' error
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // Create an object with only the required fields
      // This filters out sensitive or unnecessary information and only includes the essential fields
      // const filteredUserResult = {
      //   _id: userResult._id,
      //   name: userResult.name,
      //   email: userResult.email,
      //   countryCode: userResult.countryCode,
      //   mobileNumber: userResult.mobileNumber,
      //   panCardNumber: userResult.panCardNumber,
      //   aadhaarCardNumber: userResult.aadhaarCardNumber,
      // };

      // Return the filtered user profile
      // Send the response back to the client with the filtered user data and a success message
      return res.json(new response(userResult, responseMessage.DETAILS_FETCHED));
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error in getProfile:', error);

      // Pass the error to the next middleware, typically an error-handling middleware
      return next(error);
    }
  }

  /**
    * @swagger
    * /user/editUserFullProfile:
    *   put:
    *     tags:
    *       - USER
    *     summary: Update user profile
    *     description: Update Profile for a particular user.
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: name
    *         description: name of User
    *         in: formData
    *         required: false
    *       - name: email
    *         description: email of User
    *         in: formData
    *         required: false  
    *       - name: countryCode
    *         description: countryCode 
    *         in: formData
    *         required: false
    *       - name: mobileNumber
    *         description: mobileNumber
    *         in: formData
    *         required: false 
    *       - name: panCardNumber
    *         description: panCardNumber
    *         in: formData
    *         required: false
    *       - name: aadhaarCardNumber
    *         description: aadhaarCardNumber
    *         in: formData
    *         required: false
    *       - name: bankStatement
    *         description: fileUpload for User
    *         in: formData
    *         type: file
    *         required: false
    *       - name: gstCertificate
    *         description: fileUpload for User
    *         in: formData
    *         type: file
    *         required: false 
    *       - name: certificateOfIncorporation
    *         description: fileUpload for User
    *         in: formData
    *         type: file
    *         required: false
    *       - name: EAOA
    *         description: fileUpload for User
    *         in: formData
    *         type: file
    *         required: false
    *       - name: EMOA
    *         description: fileUpload for User
    *         in: formData
    *         type: file
    *         required: false
    *       - name: sourceOfPayment
    *         description: sourceOfPayment
    *         enum: ["SALARY", "BUSINESS", "INVESTMENT", "SAVINGS", "OTHER"]
    *         in: formData
    *         required: false
    *       - name: p2pMerchant
    *         description: p2pMerchant for User
    *         in: formData
    *         required: false
    *     responses:
    *       200:
    *         description: Returns success message
    */

  async editUserFullProfile(req, res, next) {

    // Define the validation schema
    let validationSchema = Joi.object({
      name: Joi.string().min(2).max(50).optional(),
      email: Joi.string().email().optional(),
      countryCode: Joi.string().length(2).optional(),
      mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).optional(),
      panCardNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
      aadhaarCardNumber: Joi.string().pattern(/^[0-9]{12}$/).optional(),
      sourceOfPayment: Joi.string().valid("SALARY", "BUSINESS", "INVESTMENT", "SAVINGS", "OTHER").optional(),
      p2pMerchant: Joi.string().optional(),
    });

    try {
      // Validate the request body
      const validatedBody = await validationSchema.validateAsync(req.body);
      console.log("Validated Body after Joi:", validatedBody);

      // Initialize an object to store the file URLs
      let fileUrls = {};

      // Process all uploaded files
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (file.fieldname === 'bankStatement') {
            fileUrls.bankStatement = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
          } else if (file.fieldname === 'gstCertificate') {
            fileUrls.gstCertificate = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
          } else if (file.fieldname === 'certificateOfIncorporation') {
            fileUrls.certificateOfIncorporation = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
          } else if (file.fieldname === 'EAOA') {
            fileUrls.EAOA = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
          } else if (file.fieldname === 'EMOA') {
            fileUrls.EMOA = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
          }
        });
      }
      console.log("File URLs:", fileUrls);

      // Merge validated fields and file URLs for updating the user document
      let updateObj = { ...validatedBody, ...fileUrls };
      console.log("Final Update Object:", updateObj);

      // Ensure there's something to update
      if (Object.keys(updateObj).length === 0) {
        return res.status(400).json({ message: "No data provided for update." });
      }

      // Update the user document with the new data
      const userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const result = await updateUser({ _id: userResult._id }, updateObj);
      console.log("🚀 ~ userController ~ editUserFullProfile ~ result:", result);

      return res.json(new response(result, responseMessage.USER_UPDATED));
    } catch (error) {
      console.log("error", error);
      return next(error);
    }
  }


  /**
   * @swagger
   * /user/confirmRegistration:
   *   put:
   *     summary: confirmRegistration
   *     tags:
   *       - USER
   *     description: confirmRegistration
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async confirmRegistration(req, res, next) {
    try {
      // Find the user by ID and type
      let userData = await findUser({ _id: req.userId, userType: userType.USER });

      // Check if the user exists
      if (!userData) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // Update the finalConfirmation field to true
      userData.finalConfirmation = true;

      // Save the updated user data with the finalConfirmation field
      const result = await updateUser({ _id: userData._id }, { finalConfirmation: true });
      console.log("🚀 ~ userController ~ confirmRegistration ~ result:", result);

      if (!result) {
        throw new Error("Failed to update user data.");
      }

      // Define the initial balance if needed
      const initialBalance = 0; // Set this value according to your needs or fetch it from another source

      // Upsert user wallet with the balance
      let data = await createUserWallet({
        userId: userData._id,
        balance: initialBalance
      });
      console.log("🚀 ~ userController ~ confirmRegistration ~ data:", data);

      if (!data) {
        throw new Error("Failed to upsert user wallet.");
      }

      // Include the balance in the response
      const filteredUserResult = {
        _id: result._id,
        finalConfirmation: result.finalConfirmation,
        balance: initialBalance // Include balance in the result
      };

      // Respond with the updated result
      return res.json(new response(filteredUserResult, responseMessage.UPDATE_SUCCESS));
    } catch (error) {
      console.error("Error in confirmRegistration:", error);
      return next(error); // Pass error to the global error handler
    }
  }

  /**
   * @swagger
   * /user/getMyassets:
   *   get:
   *     summary: Get Myassets
   *     tags:
   *       - USER
   *     description: Get Myassets for a particular user, with optional chain filtering.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token for authentication
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message with asset details
   */
  async getMyassets(req, res, next) {
    try {
      // Find user data
      let userData = await findUser({ _id: req.userId, userType: userType.USER });
      console.log("🚀 ~ userController ~ getMyassets ~ userData:", userData);

      // Check if the user exists
      if (!userData) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // Check if the user already has an EVM-based address
      const userTokenWallet = await findUserWallet({ userId: req.userId });

      if (!userTokenWallet || !userTokenWallet.token_address || !userTokenWallet.token_address.EVM_Based) {
        // Generate a new wallet only if the user doesn't have an EVM-based address
        const wallet = ethers.Wallet.createRandom();
        const private_key = wallet.privateKey;
        const address = wallet.address;

        // Encrypt the private key
        const IV = cryptoFunction.getIV();
        const { iv, encryptedData } = cryptoFunction.encryptKey(private_key, IV);

        // Create the new user token wallet with the generated address and encrypted private key
        await createUserTokenWallet({
          userId: req.userId,
          token_address: {
            EVM_Based: {
              address,
              privateKey: encryptedData
            }
          }
        });
      }

      // Define the aggregation pipeline
      const pipeline = [
        {
          $lookup: {
            from: "tokensContractAddress",
            localField: "chainId",
            foreignField: "chainId",
            as: "result"
          }
        },
        {
          $lookup: {
            from: "user_wallet",
            localField: "66cd596473e51d1886c4b75f",
            foreignField: "address",
            as: "balance"
          }
        },
        {
          $unwind: "$balance"
        },
        {
          $project: {
            chainId: 1,
            id: 1,
            name: 1,
            symbol: 1,
            logo: 1,
            "result.standard": 1,
            "result.contractAddress": 1,
            "result.chainId": 1,
            "result.decimal": 1,
            "balance.balance": 1
          }
        }
      ];

      // Aggregate tokens
      let list = await aggregateTokens(pipeline);
      console.log("🚀 ~ userController ~ getMyassets ~ list:", list);

      // Convert balance to dollars and store it in a new key
      if (list && list.length > 0 && list[0].balance && list[0].balance.balance) {
        const originalBalance = list[0].balance.balance;
        const convertedBalance = convertUSDToDollars(originalBalance);

        // Store the converted balance in a new key
        list[0].balance.convertedBalance = convertedBalance;
      }

      // Combine user data with the token list
      const responseData = {
        user: {
          name: userData.name,
          email: userData.email,
          availableBalance: 180.0004222,
          pendingTransaction: 20.0000,
          finalConfirmation: userData.finalConfirmation,
        },
        tokens: list
      };

      // Return the combined data
      return res.json(new response(responseData, responseMessage.GET_DATA));
    } catch (error) {
      console.error('Error getting my assets:', error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getTokens:
   *   get:
   *     summary: Get tokens
   *     tags:
   *       - USER
   *     description: Get tokens
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token for authentication
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message with asset details
   */
  async getTokens(req, res, next) {
    try {
      const tokens = await findListTokens({}, { name: 1, symbol: 1, logo: 1 });
      return res.json(new response(tokens, responseMessage.GET_DATA));
    } catch (error) {
      console.error('Error getting my assets:', error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getNetworks:
   *   get:
   *     summary: Get tokens
   *     tags:
   *       - USER
   *     description: Get tokens
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token for authentication
   *         in: header
   *         required: true
   *       - name: networkType
   *         description: networkType
   *         enum: ["mainnet","testnet"]
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message with asset details
   */
  async getNetworks(req, res, next) {
    try {
      const networks = await findChainList({ networkType: req.query.networkType }, { chain: 1, chainId: 1, symbol: 1, blockchainType: 1, tokenStandard: 1, baseType: 1 });
      return res.json(new response(networks, responseMessage.GET_DATA));
    } catch (error) {
      console.error('Error getting my assets:', error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getDepositeAddress:
   *   get:
   *     summary: Get tokens
   *     tags:
   *       - USER
   *     description: Get tokens
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token for authentication
   *         in: header
   *         required: true
   *       - name: networkType
   *         description: networkType
   *         enum: ["mainnet","testnet"]
   *         in: query
   *         required: true
   *       - name: tokenDocId
   *         description: tokenDocId
   *         in: query
   *         required: true
   *       - name: networkDocId
   *         description: networkDocId
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message with asset details
   */
  async getDepositeAddress(req, res, next) {
    try {

      let userData = await findUser({ _id: req.userId, userType: userType.USER });
      console.log("🚀 ~ userController ~ getMyassets ~ userData:", userData);

      // Check if the user exists
      if (!userData) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const network = await findChain({ _id: req.query.networkDocId });
      console.log(network.blockchainType);


      let publicAddress = '';
      const isWallet = await findUserWallet({ userId: req.userId });
      if (!isWallet && ((isWallet.token_address.EVM_Based && network.blockchainType == "EVM_Based") || (isWallet.token_address.TRON_Based && network.blockchainType == "TRON_Based"))) {
        const { publicKey, privateKey } = await walletFunction.generateWallet(network.blockchainType);
        publicAddress = publicKey;

        // Encrypt the private key
        const IV = cryptoFunction.getIV();
        const { iv, encryptedData } = cryptoFunction.encryptKey(privateKey, IV);

        const updateObj = network.blockchainType == "EVM_Based" ? {
          "token_address.EVM_Based": {
            address: publicKey,
            privateKey: { iv: IV, key: encryptedData }
          }
        } : {
          "token_address.TRON_Based": {
            address: publicKey,
            privateKey: { iv: IV, key: encryptedData }
          }
        }
        console.log("🚀 ~ userController ~ getDepositeAddress ~ updateObj:", updateObj)

        await upsertUserTokenWallet({ userId: req.userId }, updateObj);
      } else {
        publicAddress = network.blockchainType === "EVM_Based" ? isWallet.token_address.EVM_Based.address : isWallet.token_address.TRON_Based.address;
      }

      const qrcode = await QRCode.toDataURL(publicAddress);
      return res.json(new response({ publicAddress, qrcode }, responseMessage.GET_DATA));
    } catch (error) {
      console.error('Error getting my assets:', error);
      return next(error);
    }
  }

  /**
    * @swagger
    * /user/withdrawRequest:
    *   post:
    *     summary: Get tokens
    *     tags:
    *       - USER
    *     description: Get tokens
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: Token for authentication
    *         in: header
    *         required: true
    *       - name: networkType
    *         description: networkType
    *         enum: ["mainnet","testnet"]
    *         in: query
    *         required: true
    *       - name: tokenDocId
    *         description: tokenDocId
    *         in: query
    *         required: true
    *       - name: networkDocId
    *         description: networkDocId
    *         in: query
    *         required: true
    *       - name: recipientAddress
    *         description: recipientAddress
    *         in: query
    *         required: true
    *       - name: amount
    *         description: amount
    *         in: query
    *         required: true 
    *     responses:
    *       200:
    *         description: Returns success message with asset details
    */
  async withdrawRequest(req, res, next) {
    try {

      let userData = await findUser({ _id: req.userId, userType: userType.USER });
      console.log("🚀 ~ userController ~ getMyassets ~ userData:", userData);

      // Check if the user exists
      if (!userData) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const network = await findChain({ _id: req.query.networkDocId });
      console.log(network.blockchainType);

      // Generate OTP for email and mobile
      const otp = {
        email: commonFunction.getOTP(),
        mobile: commonFunction.getOTP(),
      };
      console.log("🚀 ~ userController ~ register ~ otp:", otp)
      // Set OTP expiration time (e.g., 3 minutes from now)
      const otpExpireTime = {
        email: new Date().getTime() + 180000,
        mobile: new Date().getTime() + 180000,
      };

      // Optionally send OTP via email
      // await commonFunction.sendMailOtpNodeMailer(email, otp);

      // Optionally send OTP via mobile number

      // Update user with generated OTP and expiration time
      await updateUser(
        { _id: userData._id },
        {
          otp, otpExpireTime, otpVerification: { email: false, mobile: false }
        }
      );

      return res.json(new response({}, responseMessage.DETAILS_FETCHED));



    } catch (error) {
      console.error('Error getting my assets:', error);
      return next(error);
    }
  }

  /**
    * @swagger
    * /user/getCurrency:
    *   get:
    *     summary: Get tokens
    *     tags:
    *       - USER
    *     description: Get tokens
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: Token for authentication
    *         in: header
    *         required: true
    *     responses:
    *       200:
    *         description: Returns success message with asset details
    */

  async getCurrency(req, res, next) {
    try {
      const currencyData = await findCurrency();
      return res.json(new response(currencyData, responseMessage.GET_DATA));
    } catch (error) {
      console.error('Error getting my assets:', error);
      return next(error);
    }
  }

  /**
    * @swagger
    * /user/buyCryptoInCurrency:
    *   post:
    *     summary: Get tokens
    *     tags:
    *       - USER
    *     description: Get tokens
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: Token for authentication
    *         in: header
    *         required: true
    *       - name: tokenDocId
    *         description: tokenDocId
    *         in: query
    *         required: true
    *       - name: currencyId
    *         description: currencyId
    *         in: query
    *         required: true
    *       - name: amount
    *         description: amount
    *         in: query
    *         required: true 
    *     responses:
    *       200:
    *         description: Returns success message with asset details
    */

  async buyCryptoInCurrency(req, res, next) {
    const validationSchema = Joi.object({
      tokenDocId: Joi.string().required(),
      currencyId: Joi.string().required(),
      amount: Joi.number().precision(2).required(),  // Allows for decimal values with up to 2 decimal places
    });

    try {
      // Validate request body
      const validationResult = validationSchema.validate(req.query);
      if (validationResult.error) {
        throw apiError.badRequest(validationResult.error.details[0].message);
      }

      // Find user by ID and userType
      const userData = await findUser({ _id: req.userId, userType: userType.USER });
      if (!userData) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const tokenData = await findToken({ _id: req.query.tokenDocId });
      console.log("🚀 ~ userController ~ buyCryptoInCurrency ~ tokenData:", tokenData)
      if (!tokenData) {
        throw apiError.notFound(responseMessage.CURRENCY_NOT_FOUND);
      }

      // Find currency by ID
      const currencyData = await findSingleCurrency({ _id: req.query.currencyId });
      console.log("🚀 ~ userController ~ buyCryptoInCurrency ~ currencyData:", currencyData)
      if (!currencyData) {
        throw apiError.notFound(responseMessage.CURRENCY_NOT_FOUND);
      }

      await createCryptoTransactions({
        userId: userData._id,
        currencyId: currencyData._id,
        tokenDocId: tokenData._id,
        amount: req.query.amount,
        coinName: tokenData.symbol,       // Store token symbol as coinName
        coinLogo: tokenData.logo,         // Store token logo as coinLogo
        currencyName: currencyData.symbol, // Store currency symbol as currencyName
        currencyLogo: currencyData.logo    // Store currency logo as currencyLogo
      });

      // Return a success response
      return res.json(new response({}, responseMessage.DETAILS_FETCHED));

    } catch (error) {
      console.error('Error processing buyCryptoInCurrency:', error);
      return next(error);
    }
  }

  /**
    * @swagger
    * /user/setCryptoLimit:
    *   put:
    *     summary: Get tokens
    *     tags:
    *       - USER
    *     description: Get tokens
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: Token for authentication
    *         in: header
    *         required: true
    *       - name: totalUSDT
    *         description: totalUSDT
    *         in: query
    *         required: true
    *       - name: minOrderLimit
    *         description: minOrderLimit
    *         in: query
    *         required: true
    *       - name: maxOrderLimit
    *         description: maxOrderLimit
    *         in: query
    *         required: true 
    *       - name: paymentMethod
    *         description: paymentMethod
    *         enum: ["UPI", "PAYTM", "IMPS", "BANKTRANSFER", "DIGITAL_ERUPEE"]
    *         in: query
    *         required: false
    *       - name: paymentTimeLimit
    *         description: paymentTimeLimit
    *         in: query
    *         required: true   
    *     responses:
    *       200:
    *         description: Returns success message with asset details
    */

  async setCryptoLimit(req, res, next) {
    const validationSchema = Joi.object({
      totalUSDT: Joi.number().required(),
      paymentMethod: Joi.string().required(),
      minOrderLimit: Joi.number().precision(2).required(),  // Allows for decimal values with up to 2 decimal places
      maxOrderLimit: Joi.number().precision(2).required(),  // Allows for decimal values with up to 2 decimal places
      paymentTimeLimit: Joi.number().required(),  // Time limit should be an integer, so precision is not necessary
    });

    try {
      // Validate request body
      const validationResult = validationSchema.validate(req.query); // Validating req.query, not req.body
      if (validationResult.error) {
        throw apiError.badRequest(validationResult.error.details[0].message);
      }

      // Find user by ID and userType
      const userData = await findUser({ _id: req.userId, userType: userType.USER });
      if (!userData) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // Update crypto transaction limits
      const data = await updateCryptoTransactions({ userId: userData._id, }, {
        $set: {
          totalUSDT: req.query.totalUSDT,
          paymentMethod: req.query.paymentMethod,
          minOrderLimit: req.query.minOrderLimit,
          maxOrderLimit: req.query.maxOrderLimit,
          paymentTimeLimit: req.query.paymentTimeLimit,
        }
      });
      console.log(data, 103);  // Logging data

      // Return a success response
      return res.json(new response({}, responseMessage.GET_DATA));

    } catch (error) {
      console.error('Error processing setCryptoLimit:', error);
      return next(error);
    }
  }



}
export default new userController();