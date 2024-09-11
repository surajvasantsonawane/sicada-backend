import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

   .post('/create-client', controller.createClient)
   .get('/get-applicent-status', controller.getApplicentStatus)

   .use(upload.uploadFile)
   .post('/upload-document', controller.uploadDocument)

