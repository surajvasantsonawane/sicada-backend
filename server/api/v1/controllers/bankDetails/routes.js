import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()


   .use(auth.verifyToken)

   .post('/addBankAccount',controller.addBankAccount)
   .get('/getBankDetails',controller.getBankDetails)

   

   .use(upload.uploadFile)

