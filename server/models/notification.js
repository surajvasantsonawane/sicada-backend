import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import status from '../enums/status';


const notificationSchema = new Schema({
    senderUserId: {
        type: Mongoose.Schema.ObjectId,
        ref: "user"
    },
    receiverUserId: {
        type: Mongoose.Schema.ObjectId,
        ref: "user"
    },
    deviceToken:
    {
        type:String
    },
    title: {
        type: String
    },
    body: {
        type: String
    },
    status:{
        type:String,
        default:status.ACTIVE
    }

}, {
    timestamps: true
})
notificationSchema.plugin(mongoosePaginate);
module.exports = Mongoose.model("notification", notificationSchema);