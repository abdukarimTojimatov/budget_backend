import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  paymentType: {
    type: String,
    enum: ['naqd', 'plastik'],
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExpenseCategory',
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
  },
});
expenseSchema.plugin(mongoosePaginate);
const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
