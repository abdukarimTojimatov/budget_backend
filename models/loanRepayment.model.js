import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const loanRepaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
    },
    repaidAmount: {
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
      enum: ['cash', 'bank_transfer', 'check', 'digital_wallet', 'other'],
      required: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
    },
    attachments: [{
      type: String, // File paths or URLs
    }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Add indexes for improved query performance
loanRepaymentSchema.index({ userId: 1 });
loanRepaymentSchema.index({ loanId: 1 });
loanRepaymentSchema.index({ paymentDate: -1 });

loanRepaymentSchema.plugin(mongoosePaginate);
const LoanRepayment = mongoose.model('LoanRepayment', loanRepaymentSchema);

export default LoanRepayment;
