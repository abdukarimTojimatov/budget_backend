import Income from '../models/income.model.js';
import Category from '../models/category.model.js';
import mongoose from 'mongoose';

const incomeResolver = {
  Query: {
    getIncomes: async (
      _,
      { page, limit, categoryId, startDate, endDate, recurring },
      context
    ) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        const options = {
          page: page || 1,
          limit: limit || 10,
          sort: { createdAt: -1 },
          populate: [
            { path: 'userId', select: 'username' },
            { path: 'category', select: 'name icon color' },
          ],
        };

        const query = { userId: context.req.user._id };

        // Apply filters if provided
        if (categoryId) {
          query.category = new mongoose.Types.ObjectId(categoryId);
        }

        if (recurring !== undefined) {
          query.recurring = recurring;
        }

        // Apply date range filters if provided
        if (startDate || endDate) {
          query.date = {};

          if (startDate) {
            query.date.$gte = new Date(startDate);
          }

          if (endDate) {
            // Add 1 day to include the end date fully
            const endDateObj = new Date(endDate);
            endDateObj.setDate(endDateObj.getDate() + 1);
            query.date.$lte = endDateObj;
          }
        }

        const result = await Income.paginate(query, options);
        return result;
      } catch (error) {
        console.error('Error fetching incomes:', error);
        throw new Error('Error fetching incomes: ' + error.message);
      }
    },

    getIncome: async (_, { id }, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        const income = await Income.findOne({
          _id: id,
          userId: context.req.user._id,
        }).populate([
          { path: 'userId', select: 'username' },
          { path: 'category', select: 'name icon color' },
        ]);

        if (!income) {
          throw new Error('Income not found');
        }

        return income;
      } catch (error) {
        console.error('Error fetching income:', error);
        throw new Error('Error fetching income: ' + error.message);
      }
    },

    categoryStatisticsIncome: async (_, __, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        const result = await Income.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(context.req.user._id),
            },
          },
          {
            $group: {
              _id: '$category',
              totalAmount: { $sum: '$amount' },
            },
          },
          {
            $lookup: {
              from: 'categories',
              localField: '_id',
              foreignField: '_id',
              as: 'category',
            },
          },
          { $unwind: '$category' },
          {
            $project: {
              category: 1,
              totalAmount: 1,
            },
          },
        ]);

        return result;
      } catch (error) {
        console.error('Error getting income statistics:', error);
        throw new Error('Error getting income statistics: ' + error.message);
      }
    },

    getRecurringIncomes: async (_, __, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        const incomes = await Income.find({
          userId: context.req.user._id,
          recurring: true,
        }).populate([
          { path: 'userId', select: 'username' },
          { path: 'category', select: 'name icon color' },
        ]);

        return incomes;
      } catch (error) {
        console.error('Error fetching recurring incomes:', error);
        throw new Error('Error fetching recurring incomes: ' + error.message);
      }
    },
  },

  Mutation: {
    createIncome: async (_, { input }, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        // Verify that the category exists and belongs to the user
        const category = await Category.findOne({
          _id: input.category,
          userId: context.req.user._id,
          type: 'income',
        });

        if (!category) {
          throw new Error('Invalid category selected');
        }

        const incomeData = {
          ...input,
          userId: context.req.user._id,
        };

        const newIncome = new Income(incomeData);
        await newIncome.save();

        // Populate the category field before returning
        const populatedIncome = await Income.findById(newIncome._id).populate(
          'category'
        );
        return populatedIncome;
      } catch (error) {
        console.error('Error creating income:', error);
        throw new Error('Error creating income: ' + error.message);
      }
    },

    updateIncome: async (_, { input }, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        const { _id, ...updateData } = input;

        // If category is being updated, verify it exists and belongs to the user
        if (updateData.category) {
          const category = await Category.findOne({
            _id: updateData.category,
            userId: context.req.user._id,
            type: 'income',
          });

          if (!category) {
            throw new Error('Invalid category selected');
          }
        }

        const income = await Income.findOneAndUpdate(
          { _id, userId: context.req.user._id },
          updateData,
          { new: true }
        ).populate('category');

        if (!income) {
          throw new Error(
            'Income not found or you do not have permission to update it'
          );
        }

        return income;
      } catch (error) {
        console.error('Error updating income:', error);
        throw new Error('Error updating income: ' + error.message);
      }
    },

    deleteIncome: async (_, { id }, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        const income = await Income.findOneAndDelete({
          _id: id,
          userId: context.req.user._id,
        });

        if (!income) {
          throw new Error(
            'Income not found or you do not have permission to delete it'
          );
        }

        return id;
      } catch (error) {
        console.error('Error deleting income:', error);
        throw new Error('Error deleting income: ' + error.message);
      }
    },
  },
};

export default incomeResolver;
