import Debt from '../models/debt.model.js';

const debtResolver = {
  Query: {
    getDebts: async (_, { page = 1, limit = 10, isPaidFull }, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        const query = { userId: context.req.user._id };

        // Add filter for isPaidFull if provided
        if (isPaidFull !== undefined) {
          query.isPaidFull = isPaidFull;
        }

        const options = {
          page: page,
          limit: limit,
          sort: { createdAt: -1 },
          populate: 'userId',
        };

        const debts = await Debt.paginate(query, options);
        return debts;
      } catch (error) {
        console.error('Error getting debts:', error);
        throw new Error('Error getting debts: ' + error.message);
      }
    },

    getDebt: async (_, { id }, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        const debt = await Debt.findOne({
          _id: id,
          userId: context.req.user._id,
        });

        if (!debt) {
          throw new Error(
            'Debt not found or you do not have permission to view it'
          );
        }

        return debt;
      } catch (error) {
        console.error('Error getting debt:', error);
        throw new Error('Error getting debt: ' + error.message);
      }
    },

    getUpcomingDebtPayments: async (_, { days = 7 }, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        // Find debts with due dates in the specified range
        const upcomingDebts = await Debt.find({
          userId: context.req.user._id,
          isPaidFull: { $ne: true }, // Only include unpaid debts
          dueDate: { $gte: today, $lte: futureDate },
        }).sort({ dueDate: 1 });

        return upcomingDebts;
      } catch (error) {
        console.error('Error getting upcoming debt payments:', error);
        throw new Error(
          'Error getting upcoming debt payments: ' + error.message
        );
      }
    },

    getDebtStatistics: async (_, __, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        // Aggregate to get debt statistics
        const debts = await Debt.find({ userId: context.req.user._id });

        // Calculate statistics
        let totalDebt = 0;
        let paidDebt = 0;
        let leftDebt = 0;
        let totalPaidDebts = 0;

        debts.forEach((debt) => {
          totalDebt += debt.totalDebt || 0;
          paidDebt += debt.paidDebt || 0;
          leftDebt += debt.leftDebt || 0;
          totalPaidDebts += debt.isPaidFull ? 1 : 0;
        });

        return {
          totalDebt,
          paidDebt,
          leftDebt,
          isPaidFull: totalPaidDebts,
        };
      } catch (error) {
        console.error('Error getting debt statistics:', error);
        throw new Error('Error getting debt statistics: ' + error.message);
      }
    },
  },

  Mutation: {
    createDebt: async (_, { input }, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        const {
          nameOfDebt,
          phoneNumberOfDebt,
          totalDebt,
          paymentMethodOnTakingDebt,
          startDate,
          dueDate,
          notes,
          attachments = [],
        } = input;

        // Create new debt with initial values
        const newDebt = new Debt({
          userId: context.req.user._id,
          nameOfDebt,
          phoneNumberOfDebt,
          totalDebt,
          paymentMethodOnTakingDebt,
          paidDebt: 0, // Initialize with 0
          leftDebt: totalDebt, // Initialize with full amount
          isPaidFull: false, // Initialize as not paid
          startDate,
          dueDate,
          notes,
          attachments,
        });

        // Save the new debt
        await newDebt.save();

        return newDebt;
      } catch (error) {
        console.error('Error creating debt:', error);
        throw new Error('Error creating debt: ' + error.message);
      }
    },

    updateDebt: async (_, { input }, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        const { id, ...updateData } = input;

        // Find the debt
        const debt = await Debt.findOne({
          _id: id,
          userId: context.req.user._id,
        });

        if (!debt) {
          throw new Error(
            'Debt not found or you do not have permission to update it'
          );
        }

        // If totalDebt is being updated, also update leftDebt
        if (updateData.totalDebt !== undefined) {
          updateData.leftDebt = updateData.totalDebt - (debt.paidDebt || 0);

          // Check if fully paid based on new values
          if (updateData.leftDebt <= 0) {
            updateData.isPaidFull = true;
            updateData.leftDebt = 0;
          } else {
            updateData.isPaidFull = false;
          }
        }

        // Update the debt with all provided fields
        Object.keys(updateData).forEach((key) => {
          debt[key] = updateData[key];
        });

        // Save changes
        await debt.save();

        return debt;
      } catch (error) {
        console.error('Error updating debt:', error);
        throw new Error('Error updating debt: ' + error.message);
      }
    },

    deleteDebt: async (_, { id }, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        const result = await Debt.deleteOne({
          _id: id,
          userId: context.req.user._id,
        });

        if (result.deletedCount === 0) {
          throw new Error(
            'Debt not found or you do not have permission to delete it'
          );
        }

        return true;
      } catch (error) {
        console.error('Error deleting debt:', error);
        throw new Error('Error deleting debt: ' + error.message);
      }
    },

    addDebtPayment: async (_, { input }, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        const { debtId, ...paymentData } = input;

        // Find the debt
        const debt = await Debt.findOne({
          _id: debtId,
          userId: context.req.user._id,
        });

        if (!debt) {
          throw new Error(
            'Debt not found or you do not have permission to update it'
          );
        }

        // Create payment object to add to paidDebts array
        const payment = {
          paidAmount: input.paidAmount,
          paymentDate: input.paymentDate,
          paymentMethod: input.paymentMethod,
          notes: input.notes,
          attachments: input.attachments || [],
        };

        // Add payment to paidDebts array
        debt.paidDebts.push(payment);

        // Calculate total paid debt amount - ensure all values are numbers
        const totalPaid = debt.paidDebts.reduce((sum, payment) => {
          // Convert paidAmount to number and default to 0 if NaN
          const amount = parseFloat(payment.paidAmount) || 0;
          return sum + amount;
        }, 0);
        debt.paidDebt = totalPaid;

        // Calculate remaining debt - ensure values are numbers
        debt.leftDebt = Math.max(
          0,
          parseFloat(debt.totalDebt || 0) - parseFloat(debt.paidDebt || 0)
        );

        // Check if fully paid
        if (debt.leftDebt === 0) {
          debt.isPaidFull = true;
        }

        // Save updated debt with new payment
        await debt.save();

        return debt;
      } catch (error) {
        console.error('Error adding debt payment:', error);
        throw new Error('Error adding debt payment: ' + error.message);
      }
    },

    updateDebtPayment: async (_, { input }, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        const { debtId, paymentIndex, ...updateData } = input;

        // Find the debt
        const debt = await Debt.findOne({
          _id: debtId,
          userId: context.req.user._id,
        });

        if (!debt) {
          throw new Error(
            'Debt not found or you do not have permission to update its payments'
          );
        }

        // Check if payment exists at specified index
        if (!debt.paidDebts[paymentIndex]) {
          throw new Error('Payment not found at specified index');
        }

        // Update the payment at the specified index
        Object.keys(updateData).forEach((key) => {
          if (updateData[key] !== undefined) {
            debt.paidDebts[paymentIndex][key] = updateData[key];
          }
        });

        // Recalculate totals - ensure all values are numbers
        const totalPaid = debt.paidDebts.reduce((sum, payment) => {
          // Convert paidAmount to number and default to 0 if NaN
          const amount = parseFloat(payment.paidAmount) || 0;
          return sum + amount;
        }, 0);
        debt.paidDebt = totalPaid;

        // Calculate remaining debt - ensure values are numbers
        debt.leftDebt = Math.max(
          0,
          parseFloat(debt.totalDebt || 0) - parseFloat(debt.paidDebt || 0)
        );

        // Update isPaidFull status
        debt.isPaidFull = debt.leftDebt === 0;

        // Save the updated debt
        await debt.save();

        return debt;
      } catch (error) {
        console.error('Error updating debt payment:', error);
        throw new Error('Error updating debt payment: ' + error.message);
      }
    },

    deleteDebtPayment: async (_, { debtId, paymentIndex }, context) => {
      try {
        if (!context.req.user) throw new Error('Not authenticated');

        // Find the debt
        const debt = await Debt.findOne({
          _id: debtId,
          userId: context.req.user._id,
        });

        if (!debt) {
          throw new Error(
            'Debt not found or you do not have permission to delete its payments'
          );
        }

        // Check if payment exists at specified index
        if (!debt.paidDebts[paymentIndex]) {
          throw new Error('Payment not found at specified index');
        }

        // Remove the payment at the specified index
        debt.paidDebts.splice(paymentIndex, 1);

        // Recalculate totals
        const totalPaid = debt.paidDebts.reduce((sum, payment) => {
          // Convert paidAmount to number and default to 0 if NaN
          const amount = parseFloat(payment.paidAmount) || 0;
          return sum + amount;
        }, 0);
        debt.paidDebt = totalPaid;
        debt.leftDebt = Math.max(0, debt.totalDebt - debt.paidDebt);

        // Update isPaidFull status
        debt.isPaidFull = debt.leftDebt === 0;

        // Save the updated debt
        await debt.save();

        return debt;
      } catch (error) {
        console.error('Error deleting debt payment:', error);
        throw new Error('Error deleting debt payment: ' + error.message);
      }
    },
  },
};

export default debtResolver;
