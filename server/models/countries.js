
import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from "../enums/status";

const countriesSchema = new mongoose.Schema(
    {

        countryName: { type: String}, // Symbol of the token
        logo: { type: String, required: true },
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE,
          }
    },
    {
        collection: 'countries',
        timestamps: true,
    }
);

countriesSchema.plugin(mongoosePaginate);
countriesSchema.plugin(mongooseAggregatePaginate);


const countriesList = mongoose.model('countries', countriesSchema);

export default countriesList;

 
(async () => {
    try {
        const result = await mongoose.model("countries", countriesSchema).find();
        if (result.length != 0) {
            console.log("Token List 😀.");
        } else {
            const currency = [
                {
                    countryName: 'INDIA',
                    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png",
                    status: "ACTIVE"
                },
                {
                    countryName: 'AUSTRALIA',
                    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Flag_of_Australia_%28converted%29.svg/1200px-Flag_of_Australia_%28converted%29.svg.png",
                    status: "ACTIVE"
                },
                {
                    countryName: 'SOUTH_AFRICA',
                    logo: "https://cdn.britannica.com/27/4227-050-00DBD10A/Flag-South-Africa.jpg",
                    status: "ACTIVE"
                }
          
            ];

            const createdCurrency = await countriesList.insertMany(currency);
            console.log("Currency Created 😀 ", createdCurrency);

        }
    } catch (error) {
        console.log("Admin error===>>", error);
    }
}).call();