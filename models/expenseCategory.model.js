import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const expenseCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

expenseCategorySchema.plugin(mongoosePaginate);
const ExpenseCategory = mongoose.model('ExpenseCategory', expenseCategorySchema);

export default ExpenseCategory;
