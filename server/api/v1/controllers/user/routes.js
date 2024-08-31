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

 
   
   .use(auth.verifyToken)
   .put('/editProfile',controller.editProfile)
   .get('/getProfile',controller.getProfile)
   .put('/confirmRegistration',controller.confirmRegistration)
   .post('/buyCryptoInCurrency',controller.buyCryptoInCurrency)
   .put('/setCryptoLimit',controller.setCryptoLimit)
   .put('/setBuyCryptoRemark',controller.setBuyCryptoRemark)
   .post('/sellCryptoInCurrency',controller.sellCryptoInCurrency)
   .put('/setSellCryptoLimit',controller.setSellCryptoLimit)
   .put('/setSellCryptoRemark',controller.setSellCryptoRemark)
   .get('/getSellingOrders',controller.getSellingOrders)

   
   
   .get('/getDepositeAddress',controller.getDepositeAddress)
   .post('/withdrawRequest',controller.withdrawRequest)
   .get('/getMyassets',controller.getMyassets)

   .use(upload.uploadFile)
   .post('/fileUpload', controller.fileUploadCont)
   .put('/editUserFullProfile',controller.editUserFullProfile)
