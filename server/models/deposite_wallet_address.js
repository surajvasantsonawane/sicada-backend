import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const depositeWalletSchema = new mongoose.Schema(
    {
        tron_wallet_address: { type: String, required: true },
        ethereum_wallet_address: { type: String, required: true }
    },
    {
        collection: 'deposite_wallet_address',
        timestamps: true,
    }
);

depositeWalletSchema.plugin(mongoosePaginate);
depositeWalletSchema.plugin(mongooseAggregatePaginate);


const deposite_wallet_address = mongoose.model('deposite_wallet_address', depositeWalletSchema);

export default deposite_wallet_address;

 
(async () => {
    try {
        const result = await mongoose.model("deposite_wallet_address", depositeWalletSchema).find();
        if (result.length != 0) {
            console.log("Created Admin Deposite Wallet Credentails 😀.");
        } else {
            const data = {
                tron_wallet_address: "TQHrUCFH1LKx7jbi4YQWN8eXLqs7ainPn5",
                ethereum_wallet_address: "0xdac17f958d2ee523a2206206994597c13d831ec7"
            };

            await deposite_wallet_address.create(data);
            console.log("Created Admin Deposite Wallet Credentails 😀");

        }
    } catch (error) {
        console.log("Created Admin Deposite Wallet Credentails: error===>>", error);
    }
}).call();