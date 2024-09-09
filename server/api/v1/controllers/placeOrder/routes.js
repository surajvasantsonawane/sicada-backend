import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

.get('/getPriceList',controller.getPriceList)

   .use(auth.verifyToken)
   .post('/userPlaceOrder',controller.userPlaceOrder)
   .get('/getOrderList',controller.getOrderList)
   .post('/buyOrSell',controller.placeOrderCreate)
   .post('/addPaymentMethod',controller.addPaymentMethod)
   .get('/getOrderById',controller.getOrderById)

   

   .use(upload.uploadFile)

