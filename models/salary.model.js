import mongoose from 'mongoose';

const salaryPaymentSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    workDate: {
      type: Date,
      required: true,
    },
    regularHours: {
      type: Number,
      default: 8,
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
    regularAmount: {
      type: Number,
      required: true,
    },
    overtimeAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    isAdvance: {
      type: Boolean,
      default: false, // False for regular payment, true for advance
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const SalaryPayment = mongoose.model('SalaryPayment', salaryPaymentSchema);

export default SalaryPayment;
