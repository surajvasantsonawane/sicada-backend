import Joi, { link } from "joi";
const { joiPasswordExtendCore } = require("joi-password");
const joiPassword = Joi.extend(joiPasswordExtendCore);
import _ from "lodash";
import bcrypt from "bcrypt";
import config from "config";
import Web3 from "web3";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import status from "../../../../enums/status";
import userType from "../../../../enums/userType";


import { userServices } from "../../services/user";
const { checkUserExists, createUser, emailUsernameExist, findUser, userCount, findUserData, updateUser, findAll, emailMobileExist
} = userServices;

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
    const validationSchema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      accountType: Joi.string().valid('CORPORATE', 'PRIVATE').required(),
      countryCode: Joi.string()
        .pattern(/^\+\d{1,3}$/) // Ensures country code format like +1, +91, etc.
        .required()
        .messages({
          'string.pattern.base': 'Country code must be in the format +[country code]',
          'string.empty': 'Country code is required',
          'any.required': 'Country code is required'
        }),
      mobile: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
          'string.pattern.base': 'Mobile number must be exactly 10 digits',
          'string.empty': 'Mobile number is required',
          'any.required': 'Mobile number is required'
        })
    });

    try {
      if (req.body.email) req.body.email = req.body.email.toLowerCase();

      const { error, value } = validationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { name, email, password, mobile, accountType, countryCode } = value;
      let userInfo = await emailMobileExist(mobile, email);
      if (userInfo && userInfo.isAccountCreated) {
        if (userInfo.email == email) {
          throw apiError.forbidden(responseMessage.EMAIL_EXIST)
        } else {
          throw apiError.forbidden(responseMessage.MOBILE_EXIST)
        }
      }

      if (userInfo && (userInfo.email != email || userInfo.mobileNumber != mobile)) {
        if (userInfo.email == email) {
          throw apiError.forbidden(responseMessage.EMAIL_EXIST)
        } else {
          throw apiError.forbidden(responseMessage.MOBILE_EXIST)
        }
      }

      if (!userInfo) {
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
          name,
          email,
          password: hashedPassword,
          mobileNumber: mobile,
          countryCode,
          accountType,
          otpVerification: false
        };

        // Create the user
        userInfo = await createUser(newUser);
      }

      const otp = {
        email: commonFunction.getOTP(),
        mobile: commonFunction.getOTP(),
      }
      const otpExpireTime = {
        email: new Date().getTime() + 180000,
        mobile: new Date().getTime() + 180000,
      }

      // Send OTP via email
      // await commonFunction.sendMailOtpNodeMailer(email, otp);

      // Send OTP via mobilenumber

      // Update user with OTP and expiry time
      await updateUser(
        { _id: userInfo._id },
        { otp, otpExpireTime }
      );

      const responseObj = {
        _id: userInfo._id,
        email: userInfo.email
      };
      return res.status(201).json(new response(responseObj, responseMessage.USER_CREATED));
    } catch (error) {
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
    const validationSchema = Joi.object({
      email_otp: Joi.number().required(),
      mobile_otp: Joi.number().required(),
      userId: Joi.string().required(),
    });

    try {
      const { userId } = req.params
      const { error, value } = validationSchema.validate({ ...req.body, userId: userId });
      if (error) {
        throw apiError.badRequest(error.details[0].message);
      }

      const userResult = await findUser({ _id: userId });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const { mobile_otp, email_otp } = value;

      if (new Date().getTime() > userResult.otpExpireTime.email) {
        throw apiError.badRequest(responseMessage.OTP_EMAIL_EXPIRED);
      }

      if (new Date().getTime() > userResult.otpExpireTime.mobile) {
        throw apiError.badRequest(responseMessage.OTP_MOBILE_EXPIRED);
      }

      if (userResult.otp.email !== email_otp) {
        throw apiError.badRequest(responseMessage.INCORRECT_EMAIL_OTP);
      }

      if (userResult.otp.mobile !== mobile_otp) {
        throw apiError.badRequest(responseMessage.INCORRECT_MOBILE_OTP);
      }

      const updateResult = await updateUser(
        { _id: userResult._id },
        { 'otpVerification.email': true, 'otpVerification.mobile': true, isAccountCreated: true }
      );

      const responseObj = {
        _id: updateResult._id,
        otpVerification: true,
      };

      return res.json(new response(responseObj, responseMessage.OTP_VERIFY));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/login:
   *   post:
   *     tags:
   *       - USER
   *     description: login with email and password
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: login
   *         description: login
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/login'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async login(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }

      // Validate request body
      const { error, value } = validationSchema.validate(req.body);
      if (error) throw error;

      const { email, password } = value;

      // Find user by email and status
      let userResult = await findUser({
        email: email,
        isAccountCreated: false,
        status: { $ne: status.DELETE },
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      if (userResult.status === status.BLOCK) {
        throw apiError.forbidden({ status: userResult.status, message: responseMessage.USER_BLOCKED });
      }

      if (!bcrypt.compareSync(password, userResult.password)) {
        throw apiError.conflict(responseMessage.INCORRECT_LOGIN);
      }

      // Generate token for the user
      const token = await commonFunction.getToken({
        id: userResult._id,
        email: userResult.email,
        userType: userResult.userType,
      });

      // Prepare the response object
      const results = {
        _id: userResult._id,
        email: email,
        token: token
      };

      return res.json(new response(results, responseMessage.LOGIN));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/resendotp/{userId}:
   *   post:
   *     tags:
   *       - USER
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
    const validationSchema = Joi.object({
      userId: Joi.string().required(),
      type: Joi.string().valid('email', 'mobile', 'both').required(),
    });

    try {
      const { error, value } = validationSchema.validate({
        ...req.body,
        userId: req.params.userId,
      });

      if (error) {
        throw apiError.badRequest(error.details[0].message);
      }

      const { type, userId } = value;

      const userResult = await findUser({
        _id: userId,
        isAccountCreated: both ? true : false,
        status: { $ne: status.DELETE },
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const otpExpireTime = new Date().getTime() + 180000; // 3 minutes
      const otpData = {};

      if (type === 'email' || type === 'both') {
        otpData['otp.email'] = commonFunction.getOTP();
        otpData['otpExpireTime.email'] = otpExpireTime;
        // Send email OTP
        // await commonFunction.sendMailOtpNodeMailer(userResult.email, otpData['otp.email']);
      }

      if (type === 'mobile' || type === 'both') {
        otpData['otp.mobile'] = commonFunction.getOTP();
        otpData['otpExpireTime.mobile'] = otpExpireTime;
        // Send mobile OTP
        // await commonFunction.sendMobileOtp(otpData['otp.mobile']);
      }

      await updateUser(
        { _id: userResult._id },
        otpData
      );

      return res.json(new response({ userId }, responseMessage.OTP_SEND));
    } catch (error) {
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
   *     description: fileUpload for User
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: file
   *         description: fileUpload for User
   *         in: formData
   *         type: file
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async fileUploadCont(req, res, next) {
    try {
      let data = await commonFunction.getImageUrlPhase2(req.files[0].path)
      return res.json(new response({ url: data, data: req.files }, responseMessage.UPLOAD_SUCCESS));
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }


}
export default new userController();