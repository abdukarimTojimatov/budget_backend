import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const paidDebtSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    debtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Debt',
      required: true,
    },
    paidAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'credit_card'],
      required: true,
    },
    notes: {
      type: String,
    },
    attachments: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Add indexes for improved query performance
paidDebtSchema.index({ userId: 1 });
paidDebtSchema.index({ debtId: 1 });
paidDebtSchema.index({ paymentDate: -1 });

paidDebtSchema.plugin(mongoosePaginate);
const PaidDebt = mongoose.model('PaidDebt', paidDebtSchema);

export default PaidDebt;
