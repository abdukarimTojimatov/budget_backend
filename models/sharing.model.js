import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const sharingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sharingDescription: {
      type: String,
      required: false,
    },
    sharingPaymentType: {
      type: String,
      enum: ['naqd', 'plastik'],
      required: true,
    },
    sharingCategoryType: {
      type: String,
      enum: ['Rozimuhammad', 'Elmurod', 'Egamberdi'],
      required: true,
    },
    sharingAmount: {
      type: Number,
      required: true,
    },
    sharingDate: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
// Add indexes for improved query performance
// Compound index for userId + sharingDate for efficient filtering of sharings by date
sharingSchema.index({ userId: 1, sharingDate: -1 });

// Index for sharing category type for efficient filtering
sharingSchema.index({ sharingCategoryType: 1 });

// Index for payment type filtering
sharingSchema.index({ sharingPaymentType: 1 });

sharingSchema.plugin(mongoosePaginate);
const Sharing = mongoose.model('Sharing', sharingSchema);

export default Sharing;
