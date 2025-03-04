import Order from '../models/order.model.js';
import Expense from '../models/expense.model.js';
import Sharing from '../models/sharing.model.js';
import RawMaterial from '../models/rawMaterial.model.js';

const dashboardResolver = {
  Query: {
    dashboardStatistics: async (_, { startDate, endDate }, context) => {
      if (!context.getUser()) throw new Error('Unauthorized');

      try {
        // Prepare date filters
        const dateFilter = {};
        if (startDate && endDate) {
          dateFilter.date = { $gte: startDate, $lte: endDate };
        } else if (startDate) {
          dateFilter.date = { $gte: startDate };
        } else if (endDate) {
          dateFilter.date = { $lte: endDate };
        }

        // Special case for sharing which uses sharingDate instead of date
        const sharingDateFilter = {};
        if (startDate && endDate) {
          sharingDateFilter.sharingDate = { $gte: startDate, $lte: endDate };
        } else if (startDate) {
          sharingDateFilter.sharingDate = { $gte: startDate };
        } else if (endDate) {
          sharingDateFilter.sharingDate = { $lte: endDate };
        }

        // Get order statistics
        const orderStats = await Order.aggregate([
          ...(Object.keys(dateFilter).length > 0
            ? [{ $match: dateFilter }]
            : []),
          {
            $group: {
              _id: '$orderCategory',
              orderTotalAmount: { $sum: '$orderTotalAmount' },
            },
          },
          {
            $project: {
              _id: 0,
              orderCategory: '$_id',
              orderTotalAmount: 1,
            },
          },
        ]);

        // Get expense statistics
        const expenseStats = await Expense.aggregate([
          ...(Object.keys(dateFilter).length > 0
            ? [{ $match: dateFilter }]
            : []),
          {
            $group: {
              _id: '$category',
              totalAmount: { $sum: '$amount' },
            },
          },
          {
            $project: {
              category: '$_id',
              totalAmount: 1,
              _id: 0,
            },
          },
        ]);

        // Get sharing statistics
        const sharingStats = await Sharing.aggregate([
          ...(Object.keys(sharingDateFilter).length > 0
            ? [{ $match: sharingDateFilter }]
            : []),
          {
            $group: {
              _id: '$sharingCategoryType',
              totalAmount: { $sum: '$sharingAmount' },
            },
          },
          {
            $project: {
              category: '$_id',
              totalAmount: 1,
              _id: 0,
            },
          },
        ]);

        // Get raw material statistics
        const rawMaterialStats = await RawMaterial.aggregate([
          ...(Object.keys(dateFilter).length > 0
            ? [{ $match: dateFilter }]
            : []),
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

        // Calculate totals
        const totalOrders = orderStats.reduce(
          (sum, item) => sum + item.orderTotalAmount,
          0
        );
        const totalExpenses = expenseStats.reduce(
          (sum, item) => sum + item.totalAmount,
          0
        );
        const totalSharings = sharingStats.reduce(
          (sum, item) => sum + item.totalAmount,
          0
        );
        const totalRawMaterials = rawMaterialStats.reduce(
          (sum, item) => sum + item.totalAmount,
          0
        );

        // Calculate profits
        const grossProfit = totalOrders - totalExpenses - totalRawMaterials;
        const netProfit = grossProfit - totalSharings;

        // Get client debt and payment information
        const clientDebtStats = await Order.aggregate([
          ...(Object.keys(dateFilter).length > 0
            ? [{ $match: dateFilter }]
            : []),
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$orderTotalAmount' },
              totalPaid: { $sum: '$orderTotalPaid' },
              totalDebt: { $sum: '$orderTotalDebt' },
            },
          },
        ]);

        const totalClientPaid =
          clientDebtStats.length > 0 ? clientDebtStats[0].totalPaid : 0;
        const totalClientDebt =
          clientDebtStats.length > 0 ? clientDebtStats[0].totalDebt : 0;

        // Get raw material debt and payment information
        const rawMaterialDebtStats = await RawMaterial.aggregate([
          ...(Object.keys(dateFilter).length > 0
            ? [{ $match: dateFilter }]
            : []),
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$rawMaterialTotalPrice' },
              totalPaid: { $sum: '$totalPaid' },
              totalDebt: { $sum: '$totalDebt' },
            },
          },
        ]);

        const totalRawMaterialPaid =
          rawMaterialDebtStats.length > 0
            ? rawMaterialDebtStats[0].totalPaid
            : 0;
        const totalRawMaterialDebt =
          rawMaterialDebtStats.length > 0
            ? rawMaterialDebtStats[0].totalDebt
            : 0;

        return {
          orders: orderStats,
          expenses: expenseStats,
          sharings: sharingStats,
          rawMaterials: rawMaterialStats,
          totalOrders,
          totalExpenses,
          totalSharings,
          totalRawMaterials,
          grossProfit,
          netProfit,
          totalClientDebt,
          totalClientPaid,
          totalRawMaterialDebt,
          totalRawMaterialPaid,
          startDate,
          endDate,
        };
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        throw new Error(
          'Error fetching dashboard statistics: ' + error.message
        );
      }
    },
  },
};

export default dashboardResolver;
