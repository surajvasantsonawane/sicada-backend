import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const bankDetailsSchema = new mongoose.Schema(
    {

        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'userId' }, // Reference to Token documents
        bankName: {
            type: String
        },
        accountNumber: {
            type: String
        },
        accountHolderName: {
            type: String
        },
        ifscCode: {
            type: String
        },
        branchName: {
            type: String
        },
        bankAddress: {
            type: String
        }
    },

    {
        collection: 'bankDetails',
        timestamps: true,
    }
);

bankDetailsSchema.plugin(mongoosePaginate);
bankDetailsSchema.plugin(mongooseAggregatePaginate);

const bankDetailsData = mongoose.model('bankDetails', bankDetailsSchema);

export default bankDetailsData;



