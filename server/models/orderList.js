
import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from "../enums/status";

const orderListSchema = new mongoose.Schema(
    {

        senderUserId: {
            type: mongoose.Schema.ObjectId,
            ref: "user"
        },
        receiverUserId: {
            type: mongoose.Schema.ObjectId,
            ref: "user"
        },
        transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "userPaymentTransaction" },
        paymentTimeLimit : { type: Number },
        orderNumber : { type: String },
        fiatAmount: { type: Number },
        price: { type: Number },
        transactionType: {
            type: String
        },
        receiveQuantity: { type: Number },
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE,
          }
    },
    {
        collection: 'orderList',
        timestamps: true,
    }
);

orderListSchema.plugin(mongoosePaginate);
orderListSchema.plugin(mongooseAggregatePaginate);


const orderList = mongoose.model('orderList', orderListSchema);

export default orderList;

 
