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
   .get('/getTokens',controller.getTokens)
   .get('/getNetworks',controller.getNetworks)
   .get('/getCurrency',controller.getCurrency)
   .get('/getCountriesList',controller.getCountriesList)

   
   
   .use(auth.verifyToken)
   .put('/editProfile',controller.editProfile)
   .get('/getProfile',controller.getProfile)
   .put('/confirmRegistration',controller.confirmRegistration)
   .get('/getDepositeAddress',controller.getDepositeAddress)
   .post('/withdrawRequest',controller.withdrawRequest)
   .get('/getMyassets',controller.getMyassets)
   .put('/setValueLimit',controller.setValueLimit)
   // .post('/transferINRtoUSDT',controller.transferINRtoUSDT)
   // .post('/transferUSDTtoINR',controller.transferUSDTtoINR)

   

   .use(upload.uploadFile)
   .post('/fileUpload', controller.fileUploadCont)
   .put('/editUserFullProfile',controller.editUserFullProfile)
