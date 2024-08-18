import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

   .post('/register', controller.register)
   .post('/verifyOTP/:userId', controller.verifyOTP)
   .post('/login', controller.login)
   .post('/resendotp/:userId', controller.resendOTP)

   
   .use(upload.uploadFile)
   .post('/fileUpload', controller.fileUploadCont)
   
   .use(auth.verifyToken)
   
