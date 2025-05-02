import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    currency: {
      type: String,
      default: 'UZS', // O'zbekiston so'mi
    },
    language: {
      type: String,
      default: 'uz',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      push: {
        type: Boolean,
        default: true,
      },
    },
    monthlyBudget: {
      type: Number,
      default: 0,
    },
    savingsGoal: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Add indexes for improved query performance
userSchema.index({ username: 1 });
userSchema.index({ phoneNumber: 1 });

userSchema.plugin(mongoosePaginate);
const User = mongoose.model('User', userSchema);

export default User;
