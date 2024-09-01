import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const setValueSchema = new mongoose.Schema(
    {
        minBuyValue: { type: Number, default: 0 },
        maxBuyValue: { type: Number,  default: 0 },
        minSellValue: { type: Number,  default: 0 }, 
        maxSellValue: { type: Number,  default: 0 },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }// Reference to Token documents

    },
    {
        collection: 'setValue',
        timestamps: true,
    }
);

setValueSchema.plugin(mongoosePaginate);
setValueSchema.plugin(mongooseAggregatePaginate);

const setValueData = mongoose.model('setValue', setValueSchema);

export default setValueData;

 
(async () => {
    try {
        const result = await mongoose.model("setValue", setValueSchema).find();
        if (result.length != 0) {
            console.log("Token List 😀.");
        } else {
            const setValueForUser = [
                
                {
                    minBuyValue: 11,
                    maxBuyValue: 22,
                    minSellValue: 13,
                    maxSellValue: 18
                },
              
          
            ];

            const setValueData1 = await setValueData.insertMany(setValueForUser);
            console.log("Currency Created 😀 ", setValueData1);

        }
    } catch (error) {
        console.log("Admin error===>>", error);
    }
}).call();
