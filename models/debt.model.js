import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const debtSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentMethodOnTakingDebt: {
      type: String,
      enum: ['cash', 'bank_transfer', 'credit_card'],
      required: true,
    },
    nameOfDebt: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumberOfDebt: {
      type: String,
      required: true,
      trim: true,
    },
    totalDebt: {
      type: Number,
      required: true,
      min: 0,
    },
    paidDebts: [
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
    paidDebt: {
      type: Number,
      required: false,
    },
    leftDebt: {
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
      required: true, // qarzni olgan vaqti
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
debtSchema.index({ userId: 1 });
debtSchema.index({ userId: 1, dueDate: 1 });

debtSchema.plugin(mongoosePaginate);
const Debt = mongoose.model('Debt', debtSchema);

export default Debt;
