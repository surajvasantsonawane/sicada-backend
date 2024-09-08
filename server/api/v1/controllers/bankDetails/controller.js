import Joi, { link } from "joi";
const { ethers } = require('ethers');

import _ from "lodash";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import userType from "../../../../enums/userType";

import { userServices } from "../../services/user";
const { createUser, findUser, updateUser, emailMobileExist } = userServices;

import { bankDetailsServices } from "../../services/bankDetails";
const { createBankDetails ,findBankDetails, findSingleBankDetails, updateBankDetails } = bankDetailsServices;


export class bankDetailsController {

/**
 * @swagger
 * /bankDetails/addBankAccount:
 *   post:
 *     summary: Add Bank Account
 *     tags:
 *       - BANK_DETAILS
 *     description: Submit an order request with various parameters.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: Token for authentication
 *         in: header
 *         required: true
 *       - name: addBankAccount
 *         description: Details of the order to place
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/addBankAccount'
 *     responses:
 *       200:
 *         description: Returns success message with asset details
 */

  async addBankAccount(req, res, next) {
    try {
      // Define the validation schema
      const validationSchema = Joi.object({
        accountHolderName: Joi.string().required(),
        accountNumber: Joi.string().required(),
        ifscCode: Joi.string().required(),
        bankName: Joi.string().required(),
        branchName: Joi.string().required(),
        bankAddress: Joi.string().required(),

      });
  
      const { error, value } = validationSchema.validate(req.body);
      if (error) {
        throw apiError.badRequest(error.details[0].message);
      }
  
      // Extract validated data
      const {
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
        branchName,
        bankAddress
        
      } = value;
  
      // Check if the user exists
      const userData = await findUser({ _id: req.userId, userType: userType.USER });
      if (!userData) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
  
      // Add the bank account information to the user's account
      await createBankDetails({
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
        branchName,
        bankAddress,
        userId: userData._id
      });
  
      // Return a success response
      return res.json(new response({}, responseMessage.BANK_ACCOUNT_CREATED));
  
    } catch (error) {
      console.error('Error processing addBankAccount:', error);
      return next(error);
    }
  }
  

  
  /**
   * @swagger
   * /bankDetails/getBankDetails:
   *   get:
   *     summary: Get tokens
   *     tags:
   *       - BANK_DETAILS
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

async getBankDetails(req, res, next) {
  try {

    // Find user by ID and userType
    const userData = await findUser({ _id: req.userId, userType: userType.USER });
    if (!userData) {
      throw apiError.notFound(responseMessage.USER_NOT_FOUND);
    }

    // Find crypto transactions based on filter
    const bankDetailsData = await findBankDetails({userId: userData._id});
    
    return res.json(new response(bankDetailsData, responseMessage.GET_DATA));
  } catch (error) {
    console.error('Error getting order list:', error);
    return next(error);
  }
}

}
export default new bankDetailsController();