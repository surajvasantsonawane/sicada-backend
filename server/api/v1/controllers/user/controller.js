import Joi, { link } from "joi";
const { joiPasswordExtendCore } = require("joi-password");
const joiPassword = Joi.extend(joiPasswordExtendCore);
import _ from "lodash";
import bcrypt  from "bcrypt";
import config from "config";
import Web3 from "web3";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import status from "../../../../enums/status";
import userType from "../../../../enums/userType";


import { userServices } from "../../services/user";
const { checkUserExists, createUser, emailUsernameExist, findUser, userCount, findUserData, updateUser, findAll
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
            password: Joi.string().required(), // Removed .email() to allow for password validation
            accountType: Joi.string().valid('Corporate', 'Private').required(),
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
            let userInfo = await emailUsernameExist(email);
    
            if (userInfo) {
                if (userInfo.activateUser) {
                    return res.status(400).json({ error: responseMessage.EMAIL_EXIST });
                }
            }
    
            if (!userInfo) {
                // Hash the password using bcrypt
                const hashedPassword = await bcrypt.hash(password, 10);
    
                const newUser = {
                    name,
                    email,
                    password: hashedPassword,
                    mobile,
                    countryCode,
                    accountType,
                    otpVerification: false
                };
    
                // Create the user
                userInfo = await createUser(newUser);
            }
    
            const otp = commonFunction.getOTP();
            const otpTime = new Date().getTime() + 180000; // OTP expires in 3 minutes
    
            // Send OTP via email
            await commonFunction.sendMailOtpNodeMailer(email, otp);
    
            // Update user with OTP and expiry time
            await updateUser(
                { _id: userInfo._id },
                { otp: otp, otpTime: otpTime }
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
     * /user/verifyOTP/:userId:
     *   post:
     *     tags:
     *       - USER
     *     description: verifyOTP after signUp to verified User on Platform
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userid
     *         description: userid
     *         in: query
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
             otp: Joi.number().required(),
         });
     
         try {
             const { error, value } = validationSchema.validate(req.body);
             if (error) {
                 throw apiError.badRequest(error.details[0].message);
             }
     
             const userResult = await findUser({ _id: req.query.userid });
             console.log("User Query:", { _id: req.query.userid });
             console.log("User Found:", userResult);
     
             if (!userResult) {
                 throw apiError.notFound(responseMessage.USER_NOT_FOUND);
             }
     
             const { otp } = value;
     
             if (new Date().getTime() > userResult.otpTime) {
                 throw apiError.badRequest(responseMessage.OTP_EXPIRED);
             }
     
             if (userResult.otp !== otp) {
                 throw apiError.badRequest(responseMessage.INCORRECT_OTP);
             }
     
             const updateResult = await updateUser(
                 { _id: userResult._id },
                 { otpVerification: true }
             );
     
             const responseObj = {
                 _id: updateResult._id,
                 email: updateResult.email,
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
      }req

      // Validate request body
      const { error, value } = validationSchema.validate(req.body);
      if (error) throw error;

      const { email, password } = value;

      // Find user by email and status
      let userResult = await findUser({
        email: email,
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
      var token = await commonFunction.getToken({
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
   * /user/resend:
   *   put:
   *     tags:
   *       - USER
   *     description: resendOTP for User
   *     produces:
   *       - application/json
   *     parameters:
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
    var validationSchema = {
      email: Joi.string().required(),
    };
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      var validatedBody = await Joi.validate(req.body, validationSchema);
      const { email } = validatedBody;
      var userResult = await findUser({
        email: email,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var otp = commonFunction.getOTP();
      var otpTime = new Date().getTime() + 180000;
      await commonFunction.sendMailOtpNodeMailer(email, otp);
      var updateResult = await updateUser(
        { _id: userResult._id },
        { otp: otp, otpTime: otpTime }
      );

      return res.json(new response(updateResult, responseMessage.NEW_OTP));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

}
export default new userController();