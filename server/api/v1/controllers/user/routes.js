import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

   .post('/register', controller.register)
   .post('/verifyOTP/:userId', controller.verifyOTP)
   .post('/resendotp/:userId', controller.resendOTP)
   .post('/verifySingleOTP/:userId', controller.verifySingleOTP)
   .post('/login', controller.login)

 
   
   .use(auth.verifyToken)
   .put('/editProfile',controller.editProfile)
   .get('/getProfile',controller.getProfile)
   .put('/confirmRegistration',controller.confirmRegistration)
   .post('/deposit',controller.deposit)
   .post('/withdraw',controller.withdraw)

   
   .get('/getTokens',controller.getTokens)
   .get('/getNetworks',controller.getNetworks)
   .get('/getDepositeAddress',controller.getDepositeAddress)
   
   .get('/getMyassets',controller.getMyassets)

   .use(upload.uploadFile)
   .post('/fileUpload', controller.fileUploadCont)
   .put('/editUserFullProfile',controller.editUserFullProfile)
