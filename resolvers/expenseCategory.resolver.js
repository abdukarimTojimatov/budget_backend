import ExpenseCategory from '../models/expenseCategory.model.js';

const expenseCategoryResolver = {
  Query: {
    getExpenseCategories: async () => {
      try {
        // Get all categories sorted by name
        const docs = await ExpenseCategory.find({}).sort({ name: 1 });

        // Return in a format compatible with the existing structure
        return {
          docs,
          totalDocs: docs.length,
          limit: docs.length,
          page: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        };
      } catch (error) {
        console.error('Error fetching expense categories:', error);
        throw new Error('Error fetching expense categories: ' + error.message);
      }
    },
    getExpenseCategory: async (_, { id }) => {
      try {
        const category = await ExpenseCategory.findById(id);
        if (!category) {
          throw new Error('Expense category not found');
        }
        return category;
      } catch (err) {
        console.error('Error getting expense category:', err);
        throw new Error('Error getting expense category');
      }
    },
  },
  Mutation: {
    createExpenseCategory: async (_, { input }, context) => {
      try {
        if (!context.getUser()) throw new Error('Unauthorized');

        // Check if category with this name already exists
        const existingCategory = await ExpenseCategory.findOne({
          name: input.name,
        });
        if (existingCategory) {
          throw new Error('Category with this name already exists');
        }

        const newCategory = new ExpenseCategory({
          ...input,
        });

        await newCategory.save();
        return newCategory;
      } catch (err) {
        console.error('Error creating expense category:', err);
        throw new Error(err.message || 'Error creating expense category');
      }
    },
    updateExpenseCategory: async (_, { input }, context) => {
      try {
        if (!context.getUser()) throw new Error('Unauthorized');

        const updatedCategory = await ExpenseCategory.findByIdAndUpdate(
          input._id,
          input,
          { new: true }
        );

        if (!updatedCategory) {
          throw new Error('Category not found');
        }

        return updatedCategory;
      } catch (err) {
        console.error('Error updating expense category:', err);
        throw new Error('Error updating expense category');
      }
    },
    deleteExpenseCategory: async (_, { id }, context) => {
      try {
        if (!context.getUser()) throw new Error('Unauthorized');

        const deletedCategory = await ExpenseCategory.findById(id);

        if (!deletedCategory) {
          throw new Error('Category not found');
        }

        return deletedCategory;
      } catch (err) {
        console.error('Error with expense category:', err);
        throw new Error('Error with expense category');
      }
    },
  },
};

export default expenseCategoryResolver;
