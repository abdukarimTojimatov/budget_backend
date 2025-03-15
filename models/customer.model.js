import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
  },
  { timestamps: true, versionKey: false }
);

// Add indexes for improved query performance
customerSchema.index({ userId: 1 });
customerSchema.index({ name: 1 });
customerSchema.index({ phoneNumber: 1 });

customerSchema.plugin(mongoosePaginate);
const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
