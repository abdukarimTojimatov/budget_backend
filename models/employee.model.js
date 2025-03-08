import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    dailyRate: {
      type: Number,
      required: true,
      default: 0,
    },
    overtimeRate: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for improved query performance
// Index for employee active status for filtering active/inactive employees
employeeSchema.index({ isActive: 1 });

// Index for employee positions for filtering by position
employeeSchema.index({ position: 1 });

// Index for employee name for search operations
employeeSchema.index({ name: 1 });

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
