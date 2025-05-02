import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentMethodOnGivingLoan: {
      type: String,
      enum: ['cash', 'bank_transfer', 'credit_card'],
      required: true,
    },
    nameOfLoan: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumberOfLoan: {
      type: String,
      required: true,
      trim: true,
    },
    totalLoan: {
      type: Number,
      required: true,
      min: 0,
    },
    paidLoans: [
      {
        paidAmount: {
          type: Number,
          required: false,
          min: 0,
        },
        paymentDate: {
          type: Date,
          default: Date.now,
          required: false,
        },
        paymentMethod: {
          type: String,
          enum: ['cash', 'bank_transfer', 'credit_card'],
          required: false,
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
    ],
    paidLoan: {
      type: Number,
      required: false,
    },
    leftLoan: {
      type: Number,
      required: false,
    },
    isPaidFull: {
      type: Boolean,
      required: false,
      default: false,
    },
    attachments: [
      {
        type: String,
      },
    ],
    notes: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true, // qarz berilgan vaqti
    },
    dueDate: {
      type: Date,
      required: true, // qarzni to'lash vaqti
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Add indexes for improved query performance
loanSchema.index({ userId: 1 });
loanSchema.index({ userId: 1, dueDate: 1 });

loanSchema.plugin(mongoosePaginate);
const Loan = mongoose.model('Loan', loanSchema);

export default Loan;
