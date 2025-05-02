import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const incomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    recurringPeriod: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'none'],
      default: 'none',
    },
    receiptMethod: {
      type: String,
      enum: ['cash', 'bank_deposit', 'check', 'digital_transfer', 'other'],
      required: true,
    },
    notes: {
      type: String,
    },
    attachments: [
      {
        type: String, // File paths or URLs
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Add indexes for improved query performance
incomeSchema.index({ userId: 1, date: -1 });
incomeSchema.index({ category: 1 });
incomeSchema.index({ userId: 1, recurring: 1 });

incomeSchema.plugin(mongoosePaginate);
const Income = mongoose.model('Income', incomeSchema);

export default Income;
