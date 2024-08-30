import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const cryptoTransactionSchema = new mongoose.Schema(
    {

        totalUSDT: { type: Number, required: true },
        minOrderLimit: { type: Number, required: true },
        maxOrderLimit: { type: Number, required: true },
        amount: { type: Number, required: true },
        coinName: { type: String, required: true },
        coinLogo: { type: String, required: true },
        currencyName: { type: String, required: true },
        currencyLogo: { type: String, required: true },
        paymentTimeLimit: { type: Number, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // Reference to Token documents
        currencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'currency' },// Reference to Token documents
        tokenDocId: { type: mongoose.Schema.Types.ObjectId, ref: 'tokens' }, // Reference to Token documents
        paymentMethod: {
            type: String, enum: ["UPI", "PAYTM", "IMPS", "BANKTRANSFER", "DIGITAL_ERUPEE"]
        }
    },
    {
        collection: 'cryptoTransaction',
        timestamps: true,
    }
);

cryptoTransactionSchema.plugin(mongoosePaginate);
cryptoTransactionSchema.plugin(mongooseAggregatePaginate);

const CryptoTransaction = mongoose.model('cryptoTransaction', cryptoTransactionSchema);

export default CryptoTransaction;


