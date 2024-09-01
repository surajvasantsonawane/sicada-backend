import Joi, { link } from "joi";
const { ethers } = require('ethers');

import _ from "lodash";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";

import userType from "../../../../enums/userType";


import { userServices } from "../../services/user";
const { createUser, findUser, updateUser, emailMobileExist } = userServices;

import { chainListServices } from "../../services/chain_list";
const { findChainList, findChain } = chainListServices;

import { tokenServices } from "../../services/token";
const { aggregateTokens, findListTokens, findToken } = tokenServices;

import { currencyServices } from "../../services/currency";
const { findCurrency, findSingleCurrency } = currencyServices;

import { cryptoTransactionServices } from "../../services/cryptoTransaction";
const { createCryptoTransactions, findCryptoTransactions, findCryptoTransactionsPopulateUser, updateCryptoTransactions } = cryptoTransactionServices;


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
    transactionType: Joi.string().valid('BUY', 'SELL').required(),
    tokenDocId: Joi.string().required(),
    currencyId: Joi.string().required(),
    amount: Joi.number().precision(8).required(),
    totalUSDT: Joi.number().precision(2).optional(),
    minOrderLimit: Joi.number().optional(),
    maxOrderLimit: Joi.number().optional(),
    paymentMethod: Joi.array().items(
      Joi.string().valid('UPI', 'PAYTM', 'IMPS', 'BANKTRANSFER', 'DIGITAL_ERUPEE')
    ).optional(),
    paymentTimeLimit: Joi.number().optional(),
    tags: Joi.array().items(
      Joi.string().valid('BANK_STATEMENT_REQUIRED', 'EXTRA_KYC_REQUIRED', 'NO_ADDITIONAL_VERIFICATION_NEEDED', 'NO_PAYMENT_RECEIPT_NEEDED', 'PAN_REQUIRED', 'PAYMENT_RECEIPT_REQUIRED', 'PAYMENT_GATEWAY_PAYOUT', 'PHOTO_ID_REQUIRED', 'TDS_APPLIED')
    ).optional(),
    remarks: Joi.string().optional(),
    auto_reply: Joi.string().optional(),
    regions: Joi.array().items(
      Joi.string().valid('INDIA', 'UNITED_ARABS', 'AUSTRALIA')
    ).optional(),
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
      type: transactionType
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
        Joi.string().valid('UPI', 'PAYTM', 'IMPS', 'BANKTRANSFER', 'DIGITAL_ERUPEE')
      ).optional()
    });
if (req.query.paymentMethod) {
  req.query.paymentMethod = JSON.parse(req.query.paymentMethod)
}
    // Validate the query parameters
    const { error, value } = validationSchema.validate(req.query);
    if (error) {
      throw apiError.badRequest(error.details[0].message);
    }

    // Extract validated query parameters
    const {
      transactionType, amount, paymentMethod
    } = value;

    // Construct the filter object based on provided query parameters
    const filter = {};

    if (transactionType) {
      filter.transactionType = transactionType;
    }

    if (amount) {
      filter.amount = amount;
    }

    if (paymentMethod && paymentMethod.length > 0) {
      // Validate each paymentMethod value
      const validPaymentMethods = ['UPI', 'PAYTM', 'IMPS', 'BANKTRANSFER', 'DIGITAL_ERUPEE'];
      const filteredPaymentMethods = paymentMethod.filter(method => validPaymentMethods.includes(method));

      if (filteredPaymentMethods.length === 0) {
        // If no valid payment methods, return an empty array
        return res.json(new response([], responseMessage.NO_VALID_PAYMENT_METHOD));
      }

      filter.paymentMethod = { $in: filteredPaymentMethods };
    }

    // Find user by ID and userType
    const userData = await findUser({ _id: req.userId, userType: userType.USER });
    if (!userData) {
      throw apiError.notFound(responseMessage.USER_NOT_FOUND);
    }

    // Find crypto transactions based on filter
    const currencyData = await findCryptoTransactionsPopulateUser(filter);
    return res.json(new response(currencyData, responseMessage.GET_DATA));
  } catch (error) {
    console.error('Error getting order list:', error);
    return next(error);
  }
}


}
export default new placeOrderController();