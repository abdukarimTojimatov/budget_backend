import Expense from '../models/expense.model.js';
import ExpenseCategory from '../models/expenseCategory.model.js';
import mongoose from 'mongoose';

const expenseResolver = {
  Query: {
    getExpenses: async (_, { page, limit, categoryId }) => {
      try {
        const options = {
          page,
          limit,
          populate: [
            { path: 'userId', select: 'username' },
            { path: 'category', select: 'name' },
          ],
        };

        const query = {};
        if (categoryId) {
          // Convert string ID to MongoDB ObjectId for proper matching
          query.category = new mongoose.Types.ObjectId(categoryId);
        }

        const result = await Expense.paginate(query, options);

        // Make sure to return the expenses with proper category field type
        if (result.docs && result.docs.length > 0) {
          // Now we need to make sure category is a valid Category object with name
          result.docs = result.docs.map((doc) => {
            // Convert to plain object if it's a mongoose document
            const plainDoc = doc.toObject ? doc.toObject() : { ...doc };
            
            // Make sure category has a name field that's not null
            if (plainDoc.category) {
              // If category is populated with a Category object
              if (typeof plainDoc.category === 'object') {
                // Make sure it has a name, or provide a default
                if (!plainDoc.category.name) {
                  plainDoc.category.name = plainDoc.categoryName || 'Uncategorized';
                }
              } else {
                // If it's just an ID, create a proper Category object
                const categoryId = plainDoc.category;
                plainDoc.category = {
                  _id: categoryId,
                  name: plainDoc.categoryName || 'Uncategorized'
                };
              }
            } else {
              // If category is null/undefined, provide a default
              plainDoc.category = {
                _id: null,
                name: 'Uncategorized'
              };
            }
            
            return plainDoc;
          });
        }

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
          $lookup: {
            from: 'expensecategories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryObj',
          },
        },
        {
          $unwind: {
            path: '$categoryObj',
            preserveNullAndEmptyArrays: true
          },
        },
        {
          $group: {
            _id: '$category',
            totalAmount: { $sum: '$amount' },
            categoryName: { $first: '$categoryObj.name' },
          },
        },
        {
          $project: {
            category: '$_id', // Rename _id to category
            categoryName: 1,
            totalAmount: 1, // Include totalAmount
            _id: 0, // Exclude _id from the result
          },
        },
      ]);

      console.log('Raw Category Statistics:', categoryStatistics);
      
      // Transform the results to include the proper Category object structure
      const enhancedStatistics = categoryStatistics.map(stat => {
        return {
          totalAmount: stat.totalAmount,
          // Create proper Category object
          category: {
            _id: stat.category,
            name: stat.categoryName || 'Uncategorized'
          },
          categoryName: stat.categoryName || 'Uncategorized'
        };
      });
      
      console.log('Enhanced Category Statistics:', enhancedStatistics);
      return enhancedStatistics;
    },
  },
  Mutation: {
    //
    createExpense: async (_, { input }, context) => {
      try {
        // Find the category to get its name
        const category = await ExpenseCategory.findById(input.category);
        if (!category) {
          throw new Error('Category not found');
        }

        const newExpense = new Expense({
          ...input,
          userId: context.getUser()._id,
          categoryName: category.name, // Store category name for easier access
        });

        await newExpense.save();
        
        // Populate the category before returning
        const result = await newExpense.populate('category');
        return result;
      } catch (err) {
        console.error('Error creating expense:', err);
        throw new Error(err.message || 'Error creating expense');
      }
    },
    //
    updateExpense: async (_, { input }) => {
      try {
        // If category is being updated, get the new category name
        if (input.category) {
          const category = await ExpenseCategory.findById(input.category);
          if (!category) {
            throw new Error('Category not found');
          }
          input.categoryName = category.name;
        }

        const updateExpense = await Expense.findByIdAndUpdate(
          input._id,
          input,
          { new: true }
        );
        
        // Populate the category before returning
        const result = await updateExpense.populate('category');
        return result;
      } catch (err) {
        console.error('Error updating expense:', err);
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
