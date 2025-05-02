import Category from '../models/category.model.js';
import mongoose from 'mongoose';

const categoryResolver = {
  Query: {
    getCategories: async (_, { type }, context) => {
      try {
        // Check for user in context or in req.user (more reliable)
        const authenticatedUser = context.user || context.req?.user;
        if (!authenticatedUser) {
          console.log(
            'Authentication failed in getCategories: No user found in context'
          );
          throw new Error('Not authenticated');
        }

        const query = { userId: authenticatedUser._id };

        // Filter by type if provided
        if (type) {
          query.type = type;
        }

        const options = {
          page: 1,
          limit: 100,
          sort: { name: 1 },
          populate: { path: 'userId', select: 'username' },
        };

        const result = await Category.paginate(query, options);
        return result;
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Error fetching categories: ' + error.message);
      }
    },

    getCategory: async (_, { id }, context) => {
      try {
        // Check for user in context or in req.user (more reliable)
        const authenticatedUser = context.user || context.req?.user;
        if (!authenticatedUser) {
          console.log(
            'Authentication failed in getCategory: No user found in context'
          );
          throw new Error('Not authenticated');
        }

        const category = await Category.findOne({
          _id: id,
          userId: authenticatedUser._id,
        }).populate('userId', 'username');

        if (!category) {
          throw new Error('Category not found');
        }

        return category;
      } catch (error) {
        console.error('Error fetching category:', error);
        throw new Error('Error fetching category: ' + error.message);
      }
    },

    getExpenseCategories: async (_, __, context) => {
      try {
        // Check for user in context or in req.user (more reliable)
        const authenticatedUser = context.user || context.req?.user;
        if (!authenticatedUser) {
          console.log(
            'Authentication failed in getExpenseCategories: No user found in context'
          );
          throw new Error('Not authenticated');
        }

        const query = {
          userId: authenticatedUser._id,
          type: 'expense',
        };

        const options = {
          page: 1,
          limit: 100,
          sort: { name: 1 },
          populate: { path: 'userId', select: 'username' },
        };

        const result = await Category.paginate(query, options);
        return result;
      } catch (error) {
        console.error('Error fetching expense categories:', error);
        throw new Error('Error fetching expense categories: ' + error.message);
      }
    },

    getIncomeCategories: async (_, __, context) => {
      try {
        // Check for user in context or in req.user (more reliable)
        const authenticatedUser = context.user || context.req?.user;
        if (!authenticatedUser) {
          console.log(
            'Authentication failed in getIncomeCategories: No user found in context'
          );
          throw new Error('Not authenticated');
        }

        const query = {
          userId: authenticatedUser._id,
          type: 'income',
        };

        const options = {
          page: 1,
          limit: 100,
          sort: { name: 1 },
          populate: { path: 'userId', select: 'username' },
        };

        const result = await Category.paginate(query, options);
        return result;
      } catch (error) {
        console.error('Error fetching income categories:', error);
        throw new Error('Error fetching income categories: ' + error.message);
      }
    },
  },

  Mutation: {
    createCategory: async (_, { input }, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        const authenticatedUser = context.req.user;
        if (!authenticatedUser) {
          console.log('Authentication failed: No user found in context');
          throw new Error('Not authenticated');
        }

        console.log('User authenticated:', authenticatedUser._id);

        const categoryData = {
          ...input,
          userId: authenticatedUser._id,
        };

        const newCategory = new Category(categoryData);
        await newCategory.save();

        return newCategory;
      } catch (error) {
        console.error('Error creating category:', error);
        if (error.code === 11000) {
          throw new Error(
            'A category with this name already exists for this user and type'
          );
        }
        throw new Error('Error creating category: ' + error.message);
      }
    },

    updateCategory: async (_, { input }, context) => {
      try {
        // Check for user in context or in req.user (more reliable)
        const authenticatedUser = context.user || context.req?.user;
        if (!authenticatedUser) {
          console.log(
            'Authentication failed in updateCategory: No user found in context'
          );
          throw new Error('Not authenticated');
        }

        const { _id, ...updateData } = input;

        const category = await Category.findOneAndUpdate(
          { _id, userId: authenticatedUser._id },
          updateData,
          { new: true }
        );

        if (!category) {
          throw new Error(
            'Category not found or you do not have permission to update it'
          );
        }

        return category;
      } catch (error) {
        console.error('Error updating category:', error);
        if (error.code === 11000) {
          throw new Error(
            'A category with this name already exists for this user and type'
          );
        }
        throw new Error('Error updating category: ' + error.message);
      }
    },

    deleteCategory: async (_, { id }, context) => {
      try {
        // Check for user in context or in req.user (more reliable)
        const authenticatedUser = context.user || context.req?.user;
        if (!authenticatedUser) {
          console.log(
            'Authentication failed in deleteCategory: No user found in context'
          );
          throw new Error('Not authenticated');
        }

        const category = await Category.findOneAndDelete({
          _id: id,
          userId: authenticatedUser._id,
        });

        if (!category) {
          throw new Error(
            'Category not found or you do not have permission to delete it'
          );
        }

        return category;
      } catch (error) {
        console.error('Error deleting category:', error);
        throw new Error('Error deleting category: ' + error.message);
      }
    },
  },
};

export default categoryResolver;
