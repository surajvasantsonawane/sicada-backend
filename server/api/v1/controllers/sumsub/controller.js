import Joi, { link } from "joi";

import _ from "lodash";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";

import sumsubService from "../../../../helper/sumsubService"
import userType from "../../../../enums/userType";

export class SumsubController {

  async createClient(req, res, next) {
    const { externalUserId, email, phone } = req.body;
    try {
      const applicant = await sumsubService.createApplicant(externalUserId, email, phone);
      return res.json(new response({ requestBody: req.body, applicant }, responseMessage.CREATE_CLIENT));
    } catch (error) {
      console.error('Error getting order list:', error);
      return next(error);
    }
  }

  async getApplicentStatus(req, res, next) {
    const { applicantId } = req.body;
    try {
      const applicant = await sumsubService.getApplicantStatus(applicantId);
      return res.json(new response({ requestBody: req.body, applicant }, responseMessage.GET_CLIENT_STATUS));
    } catch (error) {
      console.error('Error getting order list:', error);
      return next(error);
    }
  }

}
export default new SumsubController();