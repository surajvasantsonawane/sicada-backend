import config from "config";
import jwt from "jsonwebtoken";
import userModel from "../models/user";
import userType from "../enums/userType";
import apiError from './apiError';
import responseMessage from '../../assets/responseMessage';

module.exports = {

  verifyToken(req, res, next) {
    if (req.headers.token) {
      jwt.verify(req.headers.token, config.get('jwtsecret'), (err, result) => {
        if (err) {
          if (err.name == "TokenExpiredError") {
            throw apiError.unauthorized(responseMessage.SESSION_EXPIRED);
          }
          else {
            throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
          }
        }
        else {
          userModel.findOne({ _id: result._id }, (error, result2) => {
            if (error) {
              return next(error)
            }
            else if (!result2) {
              throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            else {
              if (result2.status == "BLOCKED") {
                throw apiError.forbidden(responseMessage.BLOCK_BY_ADMIN);
              }
              else if (result2.status == "DELETE") {
                throw apiError.invalid(responseMessage.DELETE_BY_ADMIN);
              }
              else {
                req.userId = result._id;
                req.userDetails = result
                next();
              }
            }
          })
        }
      })
    } else {
      throw apiError.invalid(responseMessage.NO_TOKEN);
    }
  },


  isAdmin(req, res, next) {
    userModel.findOne({ _id: req.userId, userType: userType.ADMIN }, (error, result) => {  
      if (error) {
        return next(error)
      }
      if (!result) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      next();
    })
  }
}



