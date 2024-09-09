import Joi, { link } from "joi";
import config from "config";
import apiError from '../../../../helper/apiError';
import auth from '../../../../helper/auth';
import status from '../../../../enums/status';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';

import _ from "lodash";


import userType from "../../../../enums/userType";


import { userServices } from "../../services/user";
const { createUser, findUser, updateUser, emailMobileExist } = userServices;

import { chainListServices } from "../../services/chain_list";
const { findChainList, findChain } = chainListServices;

import { tokenServices } from "../../services/token";
const { aggregateTokens, findListTokens, findToken } = tokenServices;


import { bankDetailsServices } from "../../services/bankDetails";
const { findBankDetails, findSingleBankDetails } = bankDetailsServices;

import { paymentTransactionServices } from "../../services/paymentTransaction";
const { createPaymentTransaction, findPaymentTransaction, findSinglePayment } = paymentTransactionServices;

import { currencyServices } from "../../services/currency";
const { findCurrency, findSingleCurrency } = currencyServices;

import { cryptoTransactionServices } from "../../services/cryptoTransaction";
const { createCryptoTransactions, findCryptoTransactions, findSingleCryptoTransactions, findCryptoTransactionsPopulateUser, updateCryptoTransactions, cryptoTransactionAggregate } = cryptoTransactionServices;

import { setValueServices } from "../../services/setValue";
const { findAllValues } = setValueServices;

import { orderListServices } from "../../services/orderList";
const { createOrderList } = orderListServices;

export class placeOrderController {

  /**
   * @swagger
   * /placeOrder/userPlaceOrder:
   *   post:
   *     summary: Place an order
   *     tags:
   *       - PLACE_ORDER
   *     description: Submit an order request with various parameters.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token for authentication
   *         in: header
   *         required: true
   *       - name: userPlaceOrder
   *         description: Details of the order to place
   *         in: body
   *         required: false
   *         schema:
   *           $ref: '#/definitions/userPlaceOrder'
   *     responses:
   *       200:
   *         description: Returns success message with asset details
   */

  async userPlaceOrder(req, res, next) {
    // Define the validation schema based on api.yaml
    const validationSchema = Joi.object({
      transactionType: Joi.string().valid('BUY', 'SELL').optional(),
      tokenDocId: Joi.string().optional(),
      currencyId: Joi.string().optional(),
      amount: Joi.number().precision(8).optional(),
      totalUSDT: Joi.number().precision(2).optional(),
      minOrderLimit: Joi.number().optional(),
      maxOrderLimit: Joi.number().optional(),
      paymentMethod: Joi.array().items(
        Joi.string().valid('UPI', 'BANKTRANSFER')
      ).optional(),
      paymentTimeLimit: Joi.number().optional(),
      tags: Joi.array().items(
        Joi.string().valid('BANK_STATEMENT_REQUIRED', 'EXTRA_KYC_REQUIRED', 'NO_ADDITIONAL_VERIFICATION_NEEDED', 'NO_PAYMENT_RECEIPT_NEEDED', 'PAN_REQUIRED', 'PAYMENT_RECEIPT_REQUIRED', 'PAYMENT_GATEWAY_PAYOUT', 'PHOTO_ID_REQUIRED', 'TDS_APPLIED')
      ).optional(),
      remarks: Joi.string().optional().allow(""),
      auto_reply: Joi.string().optional().allow(""),
      regions: Joi.string().optional(),
      registered: Joi.number().optional(),
      holdings_More_Than: Joi.number().optional(),
      cryptoStatus: Joi.array().items(
        Joi.string().valid('ONLINE_RIGHT_NOW', 'OFFLINE_MANUALLY_LATER')
      ).optional()
    });


    try {
      // Validate request body
      const { error, value } = validationSchema.validate(req.body);
      if (error) {
        throw apiError.badRequest(error.details[0].message);
      }

      // Extract validated data
      const {
        transactionType, tokenDocId, currencyId, amount, totalUSDT, minOrderLimit, maxOrderLimit,
        paymentMethod, paymentTimeLimit, tags, remarks, auto_reply, regions, registered,
        holdings_More_Than, cryptoStatus
      } = req.body;

      // Find user by ID and userType
      const userData = await findUser({ _id: req.userId, userType: userType.USER });
      if (!userData) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // Find token by ID
      const tokenData = await findToken({ _id: tokenDocId });
      if (!tokenData) {
        throw apiError.notFound(responseMessage.COIN_NOT_FOUND);
      }

      // Find currency by ID
      const currencyData = await findSingleCurrency({ _id: currencyId });
      if (!currencyData) {
        throw apiError.notFound(responseMessage.CURRENCY_NOT_FOUND);
      }

      const priceData = await findAllValues();
      console.log("🚀 ~ placeOrderController ~ userPlaceOrder ~ priceData:", priceData)
      if (!priceData) {
        throw apiError.notFound(responseMessage.VALUE_NOT_FOUND);
      }

      // Validate amount based on transactionType
      const { minBuyValue, maxBuyValue, minSellValue, maxSellValue } = priceData[0];

      if (transactionType === 'BUY' && (amount < minBuyValue || amount > maxBuyValue)) {
        throw apiError.badRequest(`Amount must be between ${minBuyValue} and ${maxBuyValue} for BUY transactions.`);
      }

      if (transactionType === 'SELL' && (amount < minSellValue || amount > maxSellValue)) {
        throw apiError.badRequest(`Amount must be between ${minSellValue} and ${maxSellValue} for SELL transactions.`);
      }

      await createPaymentTransaction({
        userId: userData._id,
        paymentMethod: paymentMethod || [], // Default to empty array if not provided
      });

      // Create crypto transaction with additional fields
      await createCryptoTransactions({
        userId: userData._id,
        currencyId: currencyData._id,
        tokenDocId: tokenData._id,
        transactionType,
        amount,
        totalUSDT,
        minOrderLimit,
        maxOrderLimit,
        paymentMethod: paymentMethod || [], // Default to empty array if not provided
        paymentTimeLimit,
        tags: tags || [], // Default to empty array if not provided
        remarks,
        auto_reply,
        regions: regions || [], // Default to empty array if not provided
        registered,
        holdings_More_Than,
        cryptoStatus: cryptoStatus || [], // Default to empty array if not provided
        coinName: tokenData.symbol,       // Store token symbol as coinName
        coinLogo: tokenData.logo,         // Store token logo as coinLogo
        currencyName: currencyData.symbol, // Store currency symbol as currencyName
        currencyLogo: currencyData.logo,    // Store currency logo as currencyLogo
        type: transactionType,
        order: 200,                    // Set order value
        completionRate: '95.00%'
      });

      // Return a success response
      return res.json(new response({}, responseMessage.DETAILS_FETCHED));

    } catch (error) {
      console.error('Error processing userPlaceOrder:', error);
      return next(error);
    }
  }

  /**
     * @swagger
     * /placeOrder/getOrderList:
     *   get:
     *     summary: Get tokens
     *     tags:
     *       - PLACE_ORDER
     *     description: Get tokens
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: Token for authentication
     *         in: header
     *         required: true
     *       - name: transactionType
     *         description: transactionType
     *         in: query
     *         required: false 
     *       - name: amount
     *         description: amount
     *         in: query
     *         required: false
     *       - name: paymentMethod
     *         description: paymentMethod
     *         in: query
     *         required: false
     *       - name: page
     *         description: page
     *         in: query
     *         required: false
     *       - name: limit
     *         description: limit
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message with asset details
     */
  async getOrderList(req, res, next) {
    try {
      // Define the validation schema for query parameters
      const validationSchema = Joi.object({
        transactionType: Joi.string().valid('BUY', 'SELL').optional(),
        amount: Joi.number().optional(),
        paymentMethod: Joi.array().items(
          Joi.string().valid('UPI', 'BANKTRANSFER')
        ).optional(),
        page: Joi.number().integer().min(1).optional().default(1),   // Pagination: page number
        limit: Joi.number().integer().min(1).optional().default(10), // Pagination: limit per page
      });

      if (req.query.paymentMethod) {
        req.query.paymentMethod = JSON.parse(req.query.paymentMethod);
      }

      // Validate the query parameters
      const { error, value } = validationSchema.validate(req.query);
      if (error) {
        throw apiError.badRequest(error.details[0].message);
      }

      // Extract validated query parameters
      const { transactionType, amount, paymentMethod, page, limit } = value;

      // Construct the filter object based on provided query parameters
      const filter = { userId: { $ne: req.userId } };

      if (transactionType) {
        // Show opposite transaction type data
        filter.transactionType = transactionType === 'BUY' ? 'SELL' : 'BUY';
      }

      if (amount) {
        filter.amount = amount;
      }

      if (paymentMethod && paymentMethod.length > 0) {
        const validPaymentMethods = ['UPI', 'BANKTRANSFER'];
        const filteredPaymentMethods = paymentMethod.filter(method => validPaymentMethods.includes(method));

        if (filteredPaymentMethods.length === 0) {
          return res.json(new response({
            data: [],
            totalpages: 0,
            page: page,
            limit: limit,
            currentpage: page
          }, responseMessage.NO_VALID_PAYMENT_METHOD));
        }

        filter.paymentMethod = { $in: filteredPaymentMethods };
      }

      // Find user by ID and userType
      const userData = await findUser({ _id: req.userId, userType: userType.USER });
      if (!userData) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // Get the total count of matching transactions
      const totalDocuments = await cryptoTransactionAggregate([
        { $match: filter },
        { $count: 'total' }  // Get the count of matching documents
      ]);

      const totalRecords = totalDocuments.length > 0 ? totalDocuments[0].total : 0;
      const totalPages = Math.ceil(totalRecords / limit);
      const skip = (page - 1) * limit;

      // Retrieve data with pagination
      const pipeline = [
        { $match: filter },
        { $skip: skip },       // Skip documents for pagination
        { $limit: limit },     // Limit the number of documents per page
        {
          $lookup: {
            from: 'user',            // Assuming user information is in the "users" collection
            localField: 'userId',
            foreignField: '_id',
            as: 'userId'
          }
        },
        { $unwind: "$userId" }, // Flatten the userId array
        {
          $project: {
            _id: 1,
            userId: 1,
            order: 1,
            completionRate: 1,
            transactionType: 1,
            paymentTimeLimit: 1,
            amount: 1,
            totalUSDT: 1,
            paymentMethod: 1
          }
        }
      ];
      console.log("pipeline: ", JSON.stringify(pipeline));
      
      let currencyData = await cryptoTransactionAggregate(pipeline);

      // Exclude transactions where the userId matches the current user's ID
      currencyData = currencyData.filter(transaction =>
        transaction.userId._id.toString() !== userData._id.toString()
      );

      // Process the data to include only required fields
      const responseData = currencyData.map(transaction => ({
        _id: transaction._id,
        finalConfirmation: userData.finalConfirmation,
        userId: transaction.userId._id,
        name: transaction.userId.name,
        order: transaction.order,
        completionRate: transaction.completionRate,
        transactionType: transaction.transactionType,
        paymentTimeLimit: transaction.paymentTimeLimit,
        amount: transaction.amount,
        totalUSDT: transaction.totalUSDT,
        paymentMethod: transaction.paymentMethod
      }));

      // Send the response with paginated data
      return res.json({
        data: responseData,
        totalpages: totalPages,
        page: page,
        limit: limit,
        currentpage: page
      });
    } catch (error) {
      console.error('Error getting order list:', error);
      return next(error);
    }
  }


  /**
     * @swagger
     * /placeOrder/getOrderById:
     *   get:
     *     summary: Get tokens
     *     tags:
     *       - PLACE_ORDER
     *     description: Get tokens
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: Token for authentication
     *         in: header
     *         required: true
     *       - name: transactionId
     *         description: transactionId
     *         in: query
     *         required: false 
     *     responses:
     *       200:
     *         description: Returns success message with asset details
     */

  async getOrderById(req, res, next) {
    try {
      const validationSchema = Joi.object({
        transactionId: Joi.string().required(),
      });

      const { error, value } = validationSchema.validate(req.query);
      if (error) {
        throw apiError.badRequest(error.details[0].message);
      }

      const { transactionId } = value;

      const userData = await findUser({ _id: req.userId, userType: userType.USER });
      if (!userData) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // Retrieve the transaction by ID and populate user data
      const userResponse = await findCryptoTransactionsPopulateUser({ _id: transactionId });

      // Log the raw userResponse to inspect what is being returned
      console.log("🚀 ~ getOrderById ~ userResponse:", userResponse);

      // Check if userResponse is valid
      if (!userResponse) {
        throw apiError.notFound(responseMessage.NO_TRANSACTIONS_FOUND);
      }

      const responseData = userResponse.map(transaction => ({
        _id: transaction._id,
        userId: transaction.userId,
        name: transaction.userId.name,
        order: transaction.order,
        completionRate: transaction.completionRate,
        transactionType: transaction.transactionType,
        paymentTimeLimit: transaction.paymentTimeLimit,
        amount: transaction.amount,
        totalUSDT: transaction.totalUSDT,
        paymentMethod: transaction.paymentMethod
      }));

      return res.json(new response(responseData, responseMessage.GET_DATA));
    } catch (error) {
      console.error('Error getting order by ID:', error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /placeOrder/buyOrSell:
   *   post:
   *     summary: Place an order
   *     tags:
   *       - PLACE_ORDER
   *     description: Submit an order request with various parameters.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token for authentication
   *         in: header
   *         required: true
   *       - name: placeOrderCreate
   *         description: placeOrderCreate
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/placeOrderCreate'
   *     responses:
   *       200:
   *         description: Returns success message with asset details
   */
  async placeOrderCreate(req, res, next) {
    const { v4: uuidv4 } = require('uuid'); // Import uuid for generating unique IDs
    const validationSchema = Joi.object({
      type: Joi.string().valid('BUY', 'SELL').required(), // Only accept BUY or SELL
      transactionId: Joi.string().required(),
      paymentMethod: Joi.string().valid('UPI', 'BANKTRANSFER').required(), // Only accept UPI or BANKTRANSFER
      fiatAmount: Joi.number().required(),
      receiveQuantity: Joi.number().required(),
    });
  
    try {
      // Validate request body
      const { error, value } = validationSchema.validate(req.body);
      if (error) {
        throw apiError.badRequest(error.details[0].message);
      }
  
      const { transactionId, paymentMethod, fiatAmount, receiveQuantity } = value;
  
      // Find user by ID and userType
      const userData = await findUser({ _id: req.userId, userType: userType.USER });
      if (!userData) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
  
      // Retrieve the transaction by ID and populate user data
      const userResponse = await findCryptoTransactionsPopulateUser({ _id: transactionId });
      console.log("🚀 ~ placeOrderController ~ buyOrSell ~ userResponse:", userResponse);
  
      if (!userResponse || userResponse.length === 0) {
        throw apiError.notFound(responseMessage.NO_TRANSACTIONS_FOUND);
      }
  
      const transaction = userResponse[0]; // Assuming you get a single transaction or the first one
  
      // Extract userId from userResponse
      const userIdFromTransaction = transaction.userId._id.toString();
  
      // Fetch the bank details using findSingleBankDetails function
      const bankDetails = await findSingleBankDetails({ userId: userIdFromTransaction });
  
      // Generate a unique ID using uuid
      const uniqueId = uuidv4();
  
      // Create order list with new fields
      await createOrderList({
        senderUserId: userData._id,
        receiverUserId: transaction.userId._id,
        paymentTimeLimit: transaction.paymentTimeLimit, // Add payment time limit from the transaction
        transactionType: transaction.transactionType,
        orderNumber: uniqueId,
        fiatAmount: fiatAmount, // Static fiatAmount value as requested
        price: transaction.amount, // Use the transaction amount as the price
        receiveQuantity: receiveQuantity, // Static receiveQuantity value as requested
        paymentMethod: paymentMethod, // Add payment method to the order list
        bankDetails: paymentMethod == "BANKTRANSFER" ? bankDetails._id : null
      });
  
      // Add the unique ID and matched bank details to the response data
      const responseData = {
        senderUserId: userData._id,
        receiverUserId: transaction.userId._id,
        transactionType: transaction.transactionType,
        paymentTimeLimit: transaction.paymentTimeLimit, // Add payment time limit from the transaction
        orderNumber: uniqueId,
        fiatAmount: fiatAmount, // Static fiatAmount value as requested
        price: transaction.amount, // Use the transaction amount as the price
        receiveQuantity: receiveQuantity, // Static receiveQuantity value as requested
        paymentMethod: paymentMethod, // Add payment method to response
        bankDetails: paymentMethod == "BANKTRANSFER" ? bankDetails : null
      };
  
      // Return the response data if the payment method matches
      return res.json(new response(responseData, responseMessage.DETAILS_FETCHED));
  
    } catch (error) {
      console.error('Error processing placeOrderCreate:', error);
      return next(error);
    }
  }
  

  /**
   * @swagger
   * /placeOrder/addPaymentMethod:
   *   post:
   *     summary: Get tokens
   *     tags:
   *       - PLACE_ORDER
   *     description: Get tokens
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token for authentication
   *         in: header
   *         required: true
   *       - name: addPaymentMethod
   *         description: addPaymentMethod
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/addPaymentMethod'
   *     responses:
   *       200:
   *         description: Returns success message with asset details
   */

  async addPaymentMethod(req, res, next) {
    const validationSchema = Joi.object({
      transactionId: Joi.string().required(),
      paymentMethod: Joi.string().required(),

    });
    try {
      const userData = await findUser({ _id: req.userId, userType: userType.USER });
      if (!userData) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const allTransactionData = await findCryptoTransactions({ transactionId: req.transactionId });
      console.log("🚀 ~ placeOrderController ~ addPaymentMethod ~ allTransactionData:", allTransactionData)

      // Send the response with the extracted paymentMethod
      return res.json(new response(allTransactionData, responseMessage.GET_DATA));
    } catch (error) {
      console.error('Error getting payment method:', error);
      return next(error);
    }
  }



  /**
     * @swagger
     * /placeOrder/getPriceList:
     *   get:
     *     summary: Get tokens
     *     tags:
     *       - PLACE_ORDER
     *     description: Get tokens
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Returns success message with asset details
     */

  async getPriceList(req, res, next) {
    try {
      const priceListData = await findAllValues();
      return res.json(new response(priceListData, responseMessage.GET_DATA));
    } catch (error) {
      console.error('Error getting order list:', error);
      return next(error);
    }
  }


}
export default new placeOrderController();