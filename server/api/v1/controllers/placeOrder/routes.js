import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()


   .use(auth.verifyToken)
   .post('/userPlaceOrder',controller.userPlaceOrder)
   .get('/getOrderList',controller.getOrderList)

   

   .use(upload.uploadFile)

