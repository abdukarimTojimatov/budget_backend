import Customer from '../models/customer.model.js';
import RawMaterial from '../models/rawMaterial.model.js';
import { GraphQLError } from 'graphql';

const customerResolver = {
  Query: {
    // Get all customers with pagination and search
    getCustomers: async (_, { page = 1, limit = 10, search = '' }, { req }) => {
      try {
        if (!req.isAuthenticated()) {
          throw new GraphQLError('You must be logged in');
        }

        const userId = req.user._id;
        
        const options = {
          page: parseInt(page),
          limit: parseInt(limit),
          sort: { createdAt: -1 },
        };

        let query = { userId };
        
        if (search) {
          query = {
            ...query,
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { phoneNumber: { $regex: search, $options: 'i' } },
            ],
          };
        }

        const customers = await Customer.paginate(query, options);
        return customers;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },

    // Get a single customer by ID
    getCustomer: async (_, { id }, { req }) => {
      try {
        if (!req.isAuthenticated()) {
          throw new GraphQLError('You must be logged in');
        }

        const userId = req.user._id;
        const customer = await Customer.findOne({ _id: id, userId });
        
        if (!customer) {
          throw new GraphQLError('Customer not found');
        }

        return customer;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },

    // Get all customers for dropdown selection (minimal data)
    getCustomersDropdown: async (_, __, { req }) => {
      try {
        if (!req.isAuthenticated()) {
          throw new GraphQLError('You must be logged in');
        }

        const userId = req.user._id;
        const customers = await Customer.find(
          { userId },
          { name: 1, phoneNumber: 1 }
        ).sort({ name: 1 });
        
        return customers;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },

  Mutation: {
    // Create a new customer
    createCustomer: async (_, { input }, { req }) => {
      try {
        if (!req.isAuthenticated()) {
          throw new GraphQLError('You must be logged in');
        }

        const userId = req.user._id;
        const { name, phoneNumber } = input;

        if (!name) {
          throw new GraphQLError('Customer name is required');
        }

        const newCustomer = new Customer({
          userId,
          name,
          phoneNumber,
        });

        const savedCustomer = await newCustomer.save();
        return savedCustomer;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },

    // Update an existing customer
    updateCustomer: async (_, { input }, { req }) => {
      try {
        if (!req.isAuthenticated()) {
          throw new GraphQLError('You must be logged in');
        }

        const userId = req.user._id;
        const { _id, name, phoneNumber } = input;

        if (!name) {
          throw new GraphQLError('Customer name is required');
        }

        const customer = await Customer.findOneAndUpdate(
          { _id, userId },
          {
            $set: {
              name,
              phoneNumber,
            },
          },
          { new: true }
        );

        if (!customer) {
          throw new GraphQLError('Customer not found');
        }

        return customer;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },

    // Delete a customer
    deleteCustomer: async (_, { id }, { req }) => {
      try {
        if (!req.isAuthenticated()) {
          throw new GraphQLError('You must be logged in');
        }

        const userId = req.user._id;

        // Check if customer is referenced in any raw materials
        const rawMaterialsCount = await RawMaterial.countDocuments({ 
          userId, 
          customer: id 
        });
        
        if (rawMaterialsCount > 0) {
          throw new GraphQLError(
            'Cannot delete customer as they are referenced in raw materials'
          );
        }

        const customer = await Customer.findOneAndDelete({
          _id: id,
          userId,
        });

        if (!customer) {
          throw new GraphQLError('Customer not found');
        }

        return customer;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
};

export default customerResolver;
