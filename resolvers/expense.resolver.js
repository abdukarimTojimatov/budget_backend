import Expense from '../models/expense.model.js';
import ExpenseCategory from '../models/expenseCategory.model.js';
import mongoose from 'mongoose';

const expenseResolver = {
  Query: {
    getExpenses: async (_, { page, limit, categoryId, startDate, endDate }) => {
      try {
        console.log('startDate', startDate);
        console.log('endDate', endDate);
        const options = {
          page,
          limit,
          populate: [
            { path: 'userId', select: 'username' },
            { path: 'category', select: 'name' },
          ],
          sort: { createdAt: -1 },
        };

        const query = {};

        // Apply category filter if provided
        if (categoryId) {
          // Convert string ID to MongoDB ObjectId for proper matching
          query.category = new mongoose.Types.ObjectId(categoryId);
        }

        // Apply date range filters if provided
        if (startDate || endDate) {
          query.date = {};

          if (startDate) {
            query.date.$gte = startDate;
          }

          if (endDate) {
            query.date.$lte = endDate;
          }
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
                  plainDoc.category.name =
                    plainDoc.categoryName || 'Uncategorized';
                }
              } else {
                // If it's just an ID, create a proper Category object
                const categoryId = plainDoc.category;
                plainDoc.category = {
                  _id: categoryId,
                  name: plainDoc.categoryName || 'Uncategorized',
                };
              }
            } else {
              // If category is null/undefined, provide a default
              plainDoc.category = {
                _id: null,
                name: 'Uncategorized',
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
        const expense = await Expense.findById(id).populate('category');
        if (!expense) {
          throw new Error('not found expense');
        }

        // Convert to plain object to modify it
        const expenseObj = expense.toObject
          ? expense.toObject()
          : { ...expense };

        // Ensure category has valid structure with a name field
        if (expenseObj.category) {
          // If category is populated with a Category object
          if (typeof expenseObj.category === 'object') {
            // Make sure it has a name, or provide a default
            if (!expenseObj.category.name) {
              expenseObj.category.name =
                expenseObj.categoryName || 'Uncategorized';
            }
          } else {
            // If it's just an ID, create a proper Category object
            const categoryId = expenseObj.category;
            expenseObj.category = {
              _id: categoryId,
              name: expenseObj.categoryName || 'Uncategorized',
            };
          }
        } else {
          // If category is null/undefined, provide a default
          expenseObj.category = {
            _id: null,
            name: 'Uncategorized',
          };
        }

        return expenseObj;
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
            preserveNullAndEmptyArrays: true,
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
      const enhancedStatistics = categoryStatistics.map((stat) => {
        return {
          totalAmount: stat.totalAmount,
          // Create proper Category object
          category: {
            _id: stat.category,
            name: stat.categoryName || 'Uncategorized',
          },
          categoryName: stat.categoryName || 'Uncategorized',
        };
      });

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
        console.log(
          'Received update expense input:',
          JSON.stringify(input, null, 2)
        );

        // First find the original expense to check what's changing
        const originalExpense = await Expense.findById(input._id);
        if (!originalExpense) {
          throw new Error('Expense not found');
        }
        console.log(
          'Original expense:',
          JSON.stringify(originalExpense, null, 2)
        );

        // Create a completely new update object, forcing an update regardless of equality
        const updateObj = {
          // Always include these fields, even if they haven't changed
          description: input.description || originalExpense.description,
          paymentType: input.paymentType || originalExpense.paymentType,
          amount:
            input.amount !== undefined ? input.amount : originalExpense.amount,
        };

        // Handle date field specifically
        if (input.date) {
          updateObj.date = input.date;
        } else {
          // If date is empty or null, keep the original date or use today
          const today = new Date();
          const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          updateObj.date = originalExpense.date || formattedDate;
        }

        // Handle category update
        if (input.category) {
          const category = await ExpenseCategory.findById(input.category);
          if (!category) {
            throw new Error('Category not found');
          }
          updateObj.category = input.category;
          updateObj.categoryName = category.name;
        } else if (originalExpense.category) {
          // Keep the original category if not changing
          updateObj.category = originalExpense.category;
        }

        // Always force an update by including the current timestamp
        // This ensures something is always updated in MongoDB
        updateObj.updatedAt = new Date();

        console.log('Final update object:', JSON.stringify(updateObj, null, 2));

        // Always update, even if the fields look the same
        // This ensures the MongoDB updatedAt field is updated
        const updatedExpense = await Expense.findByIdAndUpdate(
          input._id,
          updateObj,
          { new: true }
        );

        console.log(
          'Updated expense result:',
          JSON.stringify(updatedExpense, null, 2)
        );

        // Populate the category before returning
        const result = await updatedExpense.populate('category');
        return result;
      } catch (err) {
        console.error('Error updating expense:', err);
        throw new Error(err.message || 'Error updating expense');
      }
    },
    //
    deleteExpense: async (_, { id }) => {
      try {
        console.log('id', id);
        const deletedExpense = await Expense.findByIdAndDelete(id);
        return id;
      } catch (err) {
        console.error('Error on deleting expense:', err);
        throw new Error('Error deleting expense');
      }
    },
  },
};

export default expenseResolver;
