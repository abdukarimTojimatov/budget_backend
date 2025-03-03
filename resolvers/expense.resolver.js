import Expense from '../models/expense.model.js';
import mongoose from 'mongoose';

const expenseResolver = {
  Query: {
    getExpenses: async (_, { page, limit, category }) => {
      try {
        const options = {
          page,
          limit,
          populate: [{ path: 'userId', select: 'username' }], // Ensure correct population
        };

        const query = {};
        if (category) {
          query.category = category;
        }

        const result = await Expense.paginate(query, options);
        return result;
      } catch (error) {
        console.error('Error fetching expenses:', error);
        throw new Error('Error fetching expenses: ' + error.message);
      }
    },
    getExpense: async (_, { id }) => {
      try {
        const expense = await Expense.findById(id);
        if (!expense) {
          throw new Error('not found expense');
        }
        return expense;
      } catch (err) {
        console.error('Error getting expense:', err);
        throw new Error('Error getting expense');
      }
    },
    categoryStatisticsExpense: async (_, __, context) => {
      if (!context.getUser()) throw new Error('Unauthorized');

      const userId = context.getUser()._id;

      const objectIdUserId = new mongoose.Types.ObjectId(userId);

      const categoryStatistics = await Expense.aggregate([
        {
          $group: {
            _id: '$category',
            totalAmount: { $sum: '$amount' },
          },
        },
        {
          $project: {
            category: '$_id', // Rename _id to category
            totalAmount: 1, // Include totalAmount
            _id: 0, // Exclude _id from the result
          },
        },
      ]);

      console.log('Category Statistics:', categoryStatistics);
      return categoryStatistics;
    },
  },
  Mutation: {
    //
    createExpense: async (_, { input }, context) => {
      try {
        const newExpense = new Expense({
          ...input,
          userId: context.getUser()._id,
        });
        console.log('2');
        console.log('newExpense', newExpense);
        await newExpense.save();
        console.log('3');
        return newExpense;
      } catch (err) {
        console.error('Error creating expense:', err);
        throw new Error('Error crea');
      }
    },
    //
    updateExpense: async (_, { input }) => {
      try {
        const updateExpense = await Expense.findByIdAndUpdate(
          input._id,
          input,
          { new: true }
        );
        return updateExpense;
      } catch (err) {
        cosole.error('Error updating expense:', err);
        throw new Error('Error updating expense');
      }
    },
    //
    deleteExpense: async (_, { id }) => {
      try {
        console.log('id', id);
        const deletedExpense = await Expense.findByIdAndDelete(id);
        return deletedExpense;
      } catch (err) {
        console.error('Error on deleting expense:', err);
        throw new Error('Error deleting expense');
      }
    },
  },
};

export default expenseResolver;
