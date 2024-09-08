import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import auth from '../../../../helper/auth';
import status from '../../../../enums/status';
import response from '../../../../../assets/response';

import responseMessage from '../../../../../assets/responseMessage';
import { notificationServices } from '../../services/notification';

import { userServices } from '../../services/user';
import userType from "../../../../enums/userType";


const { createNotification, notificationList, findNotification, updateNotification, } = notificationServices;
const { findUser } = userServices;

import { orderListServices } from "../../services/orderList";
const { findOrderList } = orderListServices;

export class notificationController {

    /**
     * @swagger
     * /notification/createNotification:
     *   post:
     *     tags:
     *       - NOTIFICATION MANAGEMENT
     *     description: createNotification
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: User token
     *         in: header
     *         required: true
     *       - name: userId
     *         description: userId
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: User not found || Data not found.
     *       501:
     *         description: Something went wrong!
     */

    async createNotification(req, res, next) {
        try {
       // Define the validation schema
       const validationSchema = Joi.object({
        userId: Joi.string().required(),
      });
  
      const { error, value } = validationSchema.validate(req.query);
      if (error) {
        throw apiError.badRequest(error.details[0].message);
      }
  
      // Extract validated data
      const {
        userId        
      } = value;
      
          const userData = await findUser({ _id: req.userId, userType: userType.USER });
          if (!userData) {
            throw apiError.notFound(responseMessage.USER_NOT_FOUND);
          }
      
          const orderData = await findOrderList({ receiverUserId : userId });
          if (!orderData) {
            throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
          }
          await createNotification({
            senderUserId : userData._id,
            receiverUserId : userId
          })
          // Return a success response
          return res.json(new response({}, responseMessage.NOTIFICATION_SEND));
      
        } catch (error) {
          console.error('Error processing addBankAccount:', error);
          return next(error);
        }
      }

    /**
     * @swagger
     * /notification/listNotification:
     *   get:
     *     tags:
     *       - NOTIFICATION MANAGEMENT
     *     description: list notifications
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: User token
     *         in: header
     *         required: true
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: User not found || Data not found.
     *       501:
     *         description: Something went wrong!
     */
    async listNotification(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId, userType: userType.USER });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            else {
                const data = await notificationList({ userId: userResult._id, status: status.ACTIVE });
                if (data.length == 0) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                } else {
                    return res.json(new response(data, responseMessage.DATA_FOUND));
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /notification/viewNotification:
     *   get:
     *     tags:
     *       - NOTIFICATION MANAGEMENT
     *     description: viewStaticContent
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: User token
     *         in: header
     *         required: true
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: User not found || Data not found.
     *       501:
     *         description: Something went wrong!
     */
    async viewNotification(req, res, next) {
        try {
            let userResult = await findUser({ _id: req.userId, userType: { $in: [userType.USER, userType.EXPERT] } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            else {
                const data = await findNotification({ _id: req.params._id, userId: userResult._id, status: status.ACTIVE });
                if (data.length == 0) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                } else {
                    await updateNotification({ _id: data._id }, { $set: { isRead: true } });
                    return res.json(new response(data, responseMessage.DATA_FOUND));
                }
            }
        } catch (error) {
            return next(error);
        }
    }
   
    async getNotificationList(token) {
        let responses;
        try {
            var unReadCount = 0;
            return new Promise(async (resolve, reject) => {
                let userId = await auth.verifyTokenBySocket(token);
                const responseData = await notificationList({ userId: userId, status: { $ne: status.DELETE } })
                if (responseData.docs.length == 0) {
                    responses = ({ responseCode: 404, responseMessage: "Data not found!", responseResult: [] });;
                    resolve(responses)
                } else {
                    for (let i = 0; i < responseData.docs.length; i++) {
                        if (responseData.docs[i].isRead === false) {
                            unReadCount += 1;
                        }
                    }
                    let obj = {
                        data: responseData.docs,
                        unReadCount: unReadCount
                    }
                    responses = ({ responseCode: 200, responseMessage: "Data fetched successfully!", responseResult: obj });
                    resolve(responses)
                }
            })
        } catch (error) {
            responses = (error);
            reject(responses)
        }
    }

}


export default new notificationController()