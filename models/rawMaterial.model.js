import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import moment from 'moment';

const rawMaterialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    rawMaterialName: {
      type: String,
      required: true,
    },
    rawMaterialDescription: {
      type: String,
      required: false,
    },
    rawMaterialCategory: {
      type: String,
      required: true,
      enum: ['Machalka', 'Mehanizm', 'Kraska', 'Temir', 'Material'],
    },
    rawMaterialQuantity: {
      type: Number,
      required: true,
    },
    unitOfMeasurement: {
      type: String,
      required: true,
      enum: ['kg', 'gr', 'meter', 'dona', 'liter', 'qop', 'metrkv'],
    },
    rawMaterialPrice: {
      type: Number,
      required: true,
    },
    payments: [
      {
        paymentType: {
          type: String,
          enum: ['naqd', 'plastik'],
          required: false,
        },
        amount: {
          type: Number,
          required: false,
        },
        date: {
          type: String,
          required: false,
        },
      },
    ],
    paymentStatus: {
      type: Boolean,
      required: false,
      default: false,
    },
    rawMaterialTotalPrice: {
      type: Number,
      required: false,
    },
    totalPaid: {
      type: Number,
      required: false,
      default: 0,
    },
    totalDebt: {
      type: Number,
      required: false,
      default: 0,
    },
    date: {
      type: String,
      default: moment().format('YYYY-MM-DD HH:mm'),
    },
  },
  { timestamps: true, versionKey: false }
);

// Add indexes for improved query performance
// Compound index for userId + date for efficient filtering of user's raw materials by date
rawMaterialSchema.index({ userId: 1, date: -1 });

// Index for raw material category for efficient category filtering
rawMaterialSchema.index({ rawMaterialCategory: 1 });

// Index for payment status filtering
rawMaterialSchema.index({ paymentStatus: 1 });

// Index for customer name for search operations
rawMaterialSchema.index({ customerName: 1 });

rawMaterialSchema.plugin(mongoosePaginate);
const RawMaterial = mongoose.model('RawMaterial', rawMaterialSchema);

export default RawMaterial;
