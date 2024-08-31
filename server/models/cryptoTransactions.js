import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const cryptoTransactionSchema = new mongoose.Schema(
    {
        
        totalUSDT: { type: Number },
        minOrderLimit : { type: Number },
        maxOrderLimit : { type: Number },
        amount: { type: Number },
        coinName : { type: String },
        type : { type: String },
        coinLogo : { type: String },
        currencyName: { type: String },
        currencyLogo: { type: String },
        remarks: { type: String },
        auto_reply: { type: String },        
        paymentTimeLimit: { type: Number },
        registered: { type: Number },
        holdings_More_Than: { type: Number },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // Reference to Token documents
        currencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'currency' } ,// Reference to Token documents
        tokenDocId: { type: mongoose.Schema.Types.ObjectId, ref: 'tokens' }, // Reference to Token documents
        paymentMethod: { type: String, enum: ["UPI", "PAYTM", "IMPS", "BANKTRANSFER", "DIGITAL_ERUPEE"] },
        tags: { type: String, enum: ["BANK_STATEMENT_REQUIRED", "EXTRA_KYC_REQUIRED", "NO_ADDITIONAL_VERIFICATION_NEEDED", "NO_PAYMENT_RECEIPT_NEEDED", "PAN_REQUIRED","PAYMENT_RECEIPT_REQUIRED","PAYMENT_GATEWAY_PAYOUT","PHOTO_ID_REQUIRED","TDS_APPLIED" ]},
        regions: {type: String, enum: ["INDIA", "UNITED_ARABS", "AUSTRALIA"]},
        cryptoStatus: {type: String, enum: ["ONLINE_RIGHT_NOW", "OFFLINE_MANUALLY_LATER"]},

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


