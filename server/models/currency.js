
import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from "../enums/status";

const currencySchema = new mongoose.Schema(
    {

        symbol: { type: String, required: true }, // Symbol of the token
        logo: { type: String, required: true },
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE,
          }
    },
    {
        collection: 'currency',
        timestamps: true,
    }
);

currencySchema.plugin(mongoosePaginate);
currencySchema.plugin(mongooseAggregatePaginate);


const currencyList = mongoose.model('currency', currencySchema);

export default currencyList;

 
(async () => {
    try {
        const result = await mongoose.model("currency", currencySchema).find();
        if (result.length != 0) {
            console.log("Token List 😀.");
        } else {
            const currency = [
                {
                    symbol: 'INR',
                    logo: "https://c8.alamy.com/comp/2GE8P7B/indian-rupee-inr-currency-symbol-with-flag-2GE8P7B.jpg",
                    status: "ACTIVE"
                },
                {
                    symbol: 'USD',
                    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjJFDy6O3yfHxuHeKguyhAJMInN7CKFHPr4Q&s",
                    status: "ACTIVE"
                },
                {
                    symbol: 'EUR',
                    logo: "https://img.freepik.com/premium-vector/european-union-euro-eur-currency-gold-sign-front-view-isolated-white-background-currency-by-european-central-bank_337410-1980.jpg",
                    status: "ACTIVE"
                }
          
            ];

            const createdCurrency = await currencyList.insertMany(currency);
            console.log("Currency Created 😀 ", createdCurrency);

        }
    } catch (error) {
        console.log("Admin error===>>", error);
    }
}).call();