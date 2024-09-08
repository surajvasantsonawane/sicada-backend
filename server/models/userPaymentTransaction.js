import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';

const userPaymentTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'user',  // Referencing the User model
    },
    paymentMethod: {
      type: [String],
      enum: ['UPI', 'BANKTRANSFER']
    }
  },
  {
    collection: 'userPaymentTransaction',  // Collection name
    timestamps: true,  // Automatically add createdAt and updatedAt fields
  }
);

// Add pagination plugins to the schema
userPaymentTransactionSchema.plugin(mongoosePaginate);
userPaymentTransactionSchema.plugin(mongooseAggregatePaginate);

// Create and export the model
const UserPaymentTransaction = mongoose.model('userPaymentTransaction', userPaymentTransactionSchema);
export default UserPaymentTransaction;
