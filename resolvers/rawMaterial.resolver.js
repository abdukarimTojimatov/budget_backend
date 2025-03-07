import RawMaterial from '../models/rawMaterial.model.js';
import moment from 'moment';

const rawMaterialResolvers = {
  Query: {
    getRawMaterials: async (
      _,
      { page, limit, category, startDate, endDate }
    ) => {
      try {
        const options = {
          page,
          limit,
        };

        console.log('startDate', startDate);
        console.log('endDate', endDate);

        // Build query with filters
        const query = {};

        // Apply category filter if provided
        if (category) {
          query.rawMaterialCategory = category;
        }

        // Apply date range filters if provided
        if (startDate || endDate) {
          query.createdAt = {};

          if (startDate) {
            query.createdAt.$gte = new Date(startDate);
          }

          if (endDate) {
            // Set endDate to end of day
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            query.createdAt.$lte = endOfDay;
          }
        }

        const result = await RawMaterial.paginate(query, options);
        return result;
      } catch (error) {
        console.error('Error fetching raw materials:', error);
        throw new Error('Error fetching raw materials: ' + error.message);
      }
    },

    getRawMaterial: async (_, { id }) => {
      try {
        const rawMaterial = await RawMaterial.findById(id);
        if (!rawMaterial) {
          throw new Error('Raw Material not found');
        }
        console.log('rawMaterial', rawMaterial);
        return rawMaterial;
      } catch (error) {
        console.error('Error fetching raw material:', error);
        throw new Error('Error fetching raw material: ' + error.message);
      }
    },

    rawMaterialStatistics: async () => {
      try {
        const result = await RawMaterial.aggregate([
          {
            $group: {
              _id: '$rawMaterialCategory',
              totalAmount: { $sum: '$rawMaterialTotalPrice' },
            },
          },
          {
            $project: {
              _id: 0,
              category: '$_id',
              totalAmount: 1,
            },
          },
        ]);
        return result;
      } catch (error) {
        console.error('Error fetching raw material statistics:', error);
        throw new Error(
          'Error fetching raw material statistics: ' + error.message
        );
      }
    },
  },

  Mutation: {
    createRawMaterial: async (_, { input }, context) => {
      try {
        if (!context.getUser()) throw new Error('Unauthorized');
        console.log('input', input);

        // Destructure the input to separate out payments, quantity, and price
        const {
          payments,
          rawMaterialQuantity,
          rawMaterialPrice,
          ...otherData
        } = input;

        // Process the payments array (if provided) and ensure a proper date is set
        let processedPayments = [];
        if (payments && Array.isArray(payments)) {
          processedPayments = payments.map((payment) => ({
            paymentType: payment.paymentType,
            amount: payment.amount,
            date: payment.date || moment().format('YYYY-MM-DD HH:mm'),
          }));
        }

        // Calculate the total price from quantity and price
        const rawMaterialTotalPrice = rawMaterialQuantity * rawMaterialPrice;

        // Calculate the total paid from the payments array
        const totalPaid = processedPayments.reduce(
          (sum, payment) => sum + (payment.amount || 0),
          0
        );

        // Calculate the remaining debt
        const totalDebt = rawMaterialTotalPrice - totalPaid;

        // Determine payment status: true if fully paid or over, false otherwise
        const paymentStatus = totalPaid >= rawMaterialTotalPrice;

        // Create the new raw material document with all fields, including derived ones
        const newRawMaterial = new RawMaterial({
          ...otherData,
          userId: context.getUser()._id,
          rawMaterialQuantity,
          rawMaterialPrice,
          rawMaterialTotalPrice,
          payments: processedPayments,
          totalPaid,
          totalDebt,
          paymentStatus,
          date: moment().format('YYYY-MM-DD HH:mm'),
        });

        await newRawMaterial.save();
        return newRawMaterial;
      } catch (error) {
        console.error('Error creating raw material:', error);
        throw new Error('Error creating raw material: ' + error.message);
      }
    },

    updateRawMaterial: async (_, { input }) => {
      try {
        console.log('input', input);
        // Exclude _id, payments, and rawMaterialTotalPrice from updateData
        const { _id, payments, rawMaterialTotalPrice, ...updateData } = input;

        // Retrieve the existing raw material document.
        const rawMaterial = await RawMaterial.findById(_id);
        if (!rawMaterial) {
          throw new Error('Raw Material not found');
        }

        // Update rawMaterialQuantity and rawMaterialPrice first if provided.
        if (updateData.rawMaterialQuantity !== undefined) {
          rawMaterial.rawMaterialQuantity = updateData.rawMaterialQuantity;
        }
        if (updateData.rawMaterialPrice !== undefined) {
          rawMaterial.rawMaterialPrice = updateData.rawMaterialPrice;
        }

        // Recalculate total price based on updated quantity and price.
        rawMaterial.rawMaterialTotalPrice =
          rawMaterial.rawMaterialQuantity * rawMaterial.rawMaterialPrice;
        console.log('Updated Total Price:', rawMaterial.rawMaterialTotalPrice);

        // Update remaining fields (excluding payments, quantity, and price already handled).
        Object.keys(updateData).forEach((key) => {
          // Skip keys that we have already handled.
          if (
            key !== 'rawMaterialQuantity' &&
            key !== 'rawMaterialPrice' &&
            updateData[key] !== undefined
          ) {
            rawMaterial[key] = updateData[key];
          }
        });

        // Update payments if provided.
        if (payments) {
          // Option: Replace the entire payments array.
          rawMaterial.payments = payments.map((payment) => ({
            paymentType: payment.paymentType,
            amount: payment.amount,
            date: payment.date || moment().format('YYYY-MM-DD'),
          }));
        }

        // Recalculate the total paid from the payments array.
        rawMaterial.totalPaid = rawMaterial.payments.reduce(
          (acc, payment) => acc + (payment.amount || 0),
          0
        );

        // Recalculate total debt.
        rawMaterial.totalDebt =
          rawMaterial.rawMaterialTotalPrice - rawMaterial.totalPaid;

        // Update payment status: true if fully paid, false otherwise.
        rawMaterial.paymentStatus =
          rawMaterial.totalPaid >= rawMaterial.rawMaterialTotalPrice;

        // Save and return the updated raw material document.
        const updatedRawMaterial = await rawMaterial.save();
        return updatedRawMaterial;
      } catch (error) {
        console.error('Error updating raw material:', error);
        throw new Error('Error updating raw material: ' + error.message);
      }
    },

    deleteRawMaterial: async (_, { id }) => {
      try {
        const deletedRawMaterial = await RawMaterial.findByIdAndDelete(id);
        if (!deletedRawMaterial) {
          throw new Error('Raw Material not found');
        }
        return deletedRawMaterial;
      } catch (error) {
        console.error('Error deleting raw material:', error);
        throw new Error('Error deleting raw material: ' + error.message);
      }
    },
  },
};

export default rawMaterialResolvers;
