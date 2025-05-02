import Loan from '../models/loan.model.js';
import mongoose from 'mongoose';

const loanResolver = {
  Query: {
    getLoans: async (_, { page, limit, isPaidFull }, context) => {
      try {
        if (!context.user) throw new Error('Not authenticated');

        const options = {
          page: page || 1,
          limit: limit || 10,
          sort: { createdAt: -1 },
          populate: { path: 'userId', select: 'username' },
        };

        const query = { userId: context.user._id };

        // Apply isPaidFull filter if provided
        if (isPaidFull !== undefined) {
          query.isPaidFull = isPaidFull;
        }

        const result = await Loan.paginate(query, options);
        return result;
      } catch (error) {
        console.error('Error fetching loans:', error);
        throw new Error('Error fetching loans: ' + error.message);
      }
    },

    getLoan: async (_, { id }, context) => {
      try {
        if (!context.user) throw new Error('Not authenticated');

        const loan = await Loan.findOne({
          _id: id,
          userId: context.user._id,
        }).populate('userId', 'username');

        if (!loan) {
          throw new Error('Loan not found');
        }
        
        return loan;
      } catch (error) {
        console.error('Error fetching loan:', error);
        throw new Error('Error fetching loan: ' + error.message);
      }
    },

    getUpcomingLoanRepayments: async (_, { days = 7 }, context) => {
      try {
        if (!context.user) throw new Error('Not authenticated');

        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const upcomingLoans = await Loan.find({
          userId: context.user._id,
          isPaidFull: false, // Only include unpaid loans
          dueDate: {
            $gte: now,
            $lte: futureDate,
          },
        }).sort({ dueDate: 1 });

        return upcomingLoans;
      } catch (error) {
        console.error('Error fetching upcoming loan repayments:', error);
        throw new Error(
          'Error fetching upcoming loan repayments: ' + error.message
        );
      }
    },

    getLoanStatistics: async (_, __, context) => {
      try {
        if (!context.user) throw new Error('Not authenticated');

        // Get total loan amounts
        const totalStats = await Loan.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(context.user._id) } },
          {
            $group: {
              _id: null,
              totalLoaned: { $sum: '$totalLoan' },
              paidLoans: { $sum: '$paidLoan' },
              activeLoans: {
                $sum: {
                  $cond: [
                    { $eq: ['$isPaidFull', false] },
                    '$leftLoan',
                    0,
                  ],
                },
              },
            },
          },
        ]);

        const stats =
          totalStats.length > 0
            ? totalStats[0]
            : {
                totalLoaned: 0,
                paidLoans: 0,
                activeLoans: 0,
              };

        delete stats._id;
        return stats;
      } catch (error) {
        console.error('Error getting loan statistics:', error);
        throw new Error('Error getting loan statistics: ' + error.message);
      }
    },
  },

  Mutation: {
    createLoan: async (_, { input }, context) => {
      try {
        if (!context.user) throw new Error('Not authenticated');

        const loanData = {
          ...input,
          userId: context.user._id,
          paidLoan: 0,
          leftLoan: input.totalLoan,
          isPaidFull: false,
          paidLoans: []
        };

        const newLoan = new Loan(loanData);
        await newLoan.save();

        return newLoan;
      } catch (error) {
        console.error('Error creating loan:', error);
        throw new Error('Error creating loan: ' + error.message);
      }
    },

    updateLoan: async (_, { input }, context) => {
      try {
        if (!context.user) throw new Error('Not authenticated');

        const { _id, ...updateData } = input;
        
        // If totalLoan is changed, we need to update leftLoan as well
        if (updateData.totalLoan !== undefined) {
          const loan = await Loan.findOne({ _id, userId: context.user._id });
          if (!loan) {
            throw new Error('Loan not found');
          }
          
          // Calculate new leftLoan based on the difference between old and new totalLoan
          const paidAmount = loan.paidLoan || 0;
          updateData.leftLoan = updateData.totalLoan - paidAmount;
          
          // Update isPaidFull if needed
          if (updateData.leftLoan <= 0) {
            updateData.isPaidFull = true;
          } else {
            updateData.isPaidFull = false;
          }
        }

        const updatedLoan = await Loan.findOneAndUpdate(
          { _id, userId: context.user._id },
          updateData,
          { new: true }
        );

        if (!updatedLoan) {
          throw new Error(
            'Loan not found or you do not have permission to update it'
          );
        }

        return updatedLoan;
      } catch (error) {
        console.error('Error updating loan:', error);
        throw new Error('Error updating loan: ' + error.message);
      }
    },

    deleteLoan: async (_, { id }, context) => {
      try {
        if (!context.user) throw new Error('Not authenticated');

        const result = await Loan.findOneAndDelete({
          _id: id,
          userId: context.user._id,
        });

        if (!result) {
          throw new Error(
            'Loan not found or you do not have permission to delete it'
          );
        }

        return id;
      } catch (error) {
        console.error('Error deleting loan:', error);
        throw new Error('Error deleting loan: ' + error.message);
      }
    },

    addLoanPayment: async (_, { input }, context) => {
      try {
        if (!context.user) throw new Error('Not authenticated');

        const { loanId, paidAmount, paymentDate, paymentMethod, notes, attachments } = input;

        // Find the loan
        const loan = await Loan.findOne({
          _id: loanId,
          userId: context.user._id,
        });

        if (!loan) {
          throw new Error('Loan not found');
        }

        // Create a new payment object
        const newPayment = {
          _id: new mongoose.Types.ObjectId(),
          paidAmount: parseFloat(paidAmount) || 0,
          paymentDate: paymentDate || new Date(),
          paymentMethod,
          notes,
          attachments: attachments || []
        };

        // Update loan with new payment
        const totalPaid = (loan.paidLoan || 0) + parseFloat(paidAmount);
        const leftLoan = loan.totalLoan - totalPaid;
        const isPaidFull = leftLoan <= 0;

        // Update the loan with the new payment and updated totals
        const updatedLoan = await Loan.findByIdAndUpdate(
          loanId,
          {
            $push: { paidLoans: newPayment },
            $set: {
              paidLoan: totalPaid,
              leftLoan: leftLoan,
              isPaidFull: isPaidFull,
            },
          },
          { new: true }
        );

        return updatedLoan;
      } catch (error) {
        console.error('Error adding loan payment:', error);
        throw new Error('Error adding loan payment: ' + error.message);
      }
    },

    updateLoanPayment: async (_, { input }, context) => {
      try {
        if (!context.user) throw new Error('Not authenticated');

        const { loanId, paymentId, paidAmount, paymentDate, paymentMethod, notes, attachments } = input;

        // Find the loan
        const loan = await Loan.findOne({
          _id: loanId,
          userId: context.user._id,
        });

        if (!loan) {
          throw new Error('Loan not found');
        }

        // Find the payment
        const paymentIndex = loan.paidLoans.findIndex(
          (payment) => payment._id.toString() === paymentId
        );

        if (paymentIndex === -1) {
          throw new Error('Payment not found');
        }

        // Calculate the difference in payment amount
        const oldAmount = parseFloat(loan.paidLoans[paymentIndex].paidAmount) || 0;
        const newAmount = parseFloat(paidAmount) || oldAmount;
        const amountDifference = newAmount - oldAmount;

        // Create update object for the payment
        const updateData = {};
        if (paidAmount !== undefined) updateData[`paidLoans.${paymentIndex}.paidAmount`] = newAmount;
        if (paymentDate !== undefined) updateData[`paidLoans.${paymentIndex}.paymentDate`] = paymentDate;
        if (paymentMethod !== undefined) updateData[`paidLoans.${paymentIndex}.paymentMethod`] = paymentMethod;
        if (notes !== undefined) updateData[`paidLoans.${paymentIndex}.notes`] = notes;
        if (attachments !== undefined) updateData[`paidLoans.${paymentIndex}.attachments`] = attachments;

        // Update the total paid amount and remaining amount
        const newTotalPaid = (loan.paidLoan || 0) + amountDifference;
        const newLeftLoan = loan.totalLoan - newTotalPaid;
        const isPaidFull = newLeftLoan <= 0;

        // Update the loan with the new payment data and totals
        const updatedLoan = await Loan.findByIdAndUpdate(
          loanId,
          {
            $set: {
              ...updateData,
              paidLoan: newTotalPaid,
              leftLoan: newLeftLoan,
              isPaidFull: isPaidFull,
            },
          },
          { new: true }
        );

        return updatedLoan;
      } catch (error) {
        console.error('Error updating loan payment:', error);
        throw new Error('Error updating loan payment: ' + error.message);
      }
    },

    deleteLoanPayment: async (_, { loanId, paymentId }, context) => {
      try {
        if (!context.user) throw new Error('Not authenticated');

        // Find the loan
        const loan = await Loan.findOne({
          _id: loanId,
          userId: context.user._id,
        });

        if (!loan) {
          throw new Error('Loan not found');
        }

        // Find the payment to delete
        const payment = loan.paidLoans.find(
          (p) => p._id.toString() === paymentId
        );

        if (!payment) {
          throw new Error('Payment not found');
        }

        // Calculate the new totals
        const paidAmount = parseFloat(payment.paidAmount) || 0;
        const newTotalPaid = (loan.paidLoan || 0) - paidAmount;
        const newLeftLoan = loan.totalLoan - newTotalPaid;
        const isPaidFull = newLeftLoan <= 0;

        // Remove the payment and update the totals
        const updatedLoan = await Loan.findByIdAndUpdate(
          loanId,
          {
            $pull: { paidLoans: { _id: new mongoose.Types.ObjectId(paymentId) } },
            $set: {
              paidLoan: newTotalPaid,
              leftLoan: newLeftLoan,
              isPaidFull: isPaidFull,
            },
          },
          { new: true }
        );

        return updatedLoan;
      } catch (error) {
        console.error('Error deleting loan payment:', error);
        throw new Error('Error deleting loan payment: ' + error.message);
      }
    },
  },
};

export default loanResolver;
