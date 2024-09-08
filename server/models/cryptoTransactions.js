import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const cryptoTransactionSchema = new mongoose.Schema(
    {
        transactionType: {
            type: String,
            enum: ['BUY', 'SELL'],
        },
        tokenDocId: {
            type: mongoose.Schema.Types.ObjectId,

            ref: 'Token' // Assuming you have a Token model
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,

            ref: 'user' // Assuming you have a Currency model
        },
        currencyId: {
            type: mongoose.Schema.Types.ObjectId,

            ref: 'Currency' // Assuming you have a Currency model
        },
        amount: {
            type: Number,
            min: 0,
            get: (v) => Math.round(v * 100000000) / 100000000 // Precision of 8 decimal places
        },
        totalUSDT: {
            type: Number,
            default: 0,
            min: 0,
            get: (v) => Math.round(v * 100) / 100 // Precision of 2 decimal places
        },
        order: { type: Number},
        completionRate: { type: String},
        minOrderLimit: {
            type: Number,
            default: 0,
            min: 0
        },
        maxOrderLimit: {
            type: Number,
            default: 0,
            min: 0
        },
        paymentMethod: {
            type: [String],
            enum: ['UPI', 'PAYTM', 'IMPS', 'BANKTRANSFER', 'DIGITAL_ERUPEE'],
            default: []
        },
        paymentTimeLimit: {
            type: Number,
            default: 0,
            min: 0
        },
        tags: {
            type: [String],
            enum: ['BANK_STATEMENT_REQUIRED', 'EXTRA_KYC_REQUIRED', 'NO_ADDITIONAL_VERIFICATION_NEEDED', 'NO_PAYMENT_RECEIPT_NEEDED', 'PAN_REQUIRED', 'PAYMENT_RECEIPT_REQUIRED', 'PAYMENT_GATEWAY_PAYOUT', 'PHOTO_ID_REQUIRED', 'TDS_APPLIED'],
            default: []
        },
        remarks: {
            type: String,
            default: ''
        },
        auto_reply: {
            type: String,
            default: ''
        },
        regions: {
            type: String,
            default: 'INDIA'
        },
        registered: {
            type: Number,
            default: 0,
            min: 0
        },
        holdings_More_Than: {
            type: Number,
            default: 0,
            min: 0
        },
        cryptoStatus: {
            type: [String],
            enum: ['ONLINE_RIGHT_NOW', 'OFFLINE_MANUALLY_LATER'],
            default: []
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


