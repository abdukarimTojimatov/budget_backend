import Order from '../models/order.model.js';
import Expense from '../models/expense.model.js';
import Sharing from '../models/sharing.model.js';
import RawMaterial from '../models/rawMaterial.model.js';
import ExpenseCategory from '../models/expenseCategory.model.js';

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

        // Enhance expense stats with category names
        const categoryIds = expenseStats.map((stat) => stat.category);
        console.log('Category IDs:', categoryIds);
        
        const categories = await ExpenseCategory.find({
          _id: { $in: categoryIds },
        });
        console.log('Found categories:', categories.map(c => ({ id: c._id.toString(), name: c.name })));

        // Add category names to expense stats
        const enhancedExpenseStats = expenseStats.map((stat) => {
          console.log('Looking for category match for:', stat.category);
          
          // Find matching category
          const category = categories.find(
            (cat) => {
              const catIdStr = cat._id.toString();
              const statCatStr = typeof stat.category === 'object' ? stat.category.toString() : stat.category;
              console.log(`Comparing: ${catIdStr} === ${statCatStr}`, catIdStr === statCatStr);
              return catIdStr === statCatStr;
            }
          );

          // Now we need to return a Category object instead of just the ID
          const categoryId = typeof stat.category === 'object' ? stat.category.toString() : stat.category;
          const categoryName = category ? category.name : 'Uncategorized';
          
          return {
            ...stat,
            // Return a proper Category object with _id and name
            category: {
              _id: categoryId,
              name: categoryName
            },
            // Keep categoryName for backward compatibility
            categoryName: categoryName,
          };
        });
        console.log('Enhanced stats:', enhancedExpenseStats);
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

        // Get order expenses total amount
        const orderExpensesStats = await Order.aggregate([
          ...(Object.keys(dateFilter).length > 0
            ? [{ $match: dateFilter }]
            : []),
          {
            $group: {
              _id: null,
              totalOrderExpenses: { $sum: '$orderExpensesAmount' },
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
        const totalOrderExpenses =
          orderExpensesStats.length > 0
            ? orderExpensesStats[0].totalOrderExpenses
            : 0;

        // Calculate profits
        const grossProfit = totalOrders - totalOrderExpenses;
        const netProfit = grossProfit - totalExpenses;

        // Calculate total expenses amount (all costs combined)

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

        // Get customers with debt
        const customersWithDebt = await Order.aggregate([
          ...(Object.keys(dateFilter).length > 0
            ? [{ $match: dateFilter }]
            : []),
          { $match: { orderTotalDebt: { $gt: 0 } } },
          {
            $group: {
              _id: {
                customerName: '$orderCustomerName',
                phoneNumber: '$orderCustomerPhoneNumber',
              },
              totalDebt: { $sum: '$orderTotalDebt' },
              totalPaid: { $sum: '$orderTotalPaid' },
              totalAmount: { $sum: '$orderTotalAmount' },
            },
          },
          {
            $project: {
              _id: 0,
              customerName: '$_id.customerName',
              phoneNumber: '$_id.phoneNumber',
              totalDebt: 1,
              totalPaid: 1,
              totalAmount: 1,
            },
          },
          { $sort: { totalDebt: -1 } },
        ]);

        // Get suppliers with debt
        const suppliersWithDebt = await RawMaterial.aggregate([
          ...(Object.keys(dateFilter).length > 0
            ? [{ $match: dateFilter }]
            : []),
          { $match: { totalDebt: { $gt: 0 } } },
          {
            $group: {
              _id: {
                supplierName: '$customerName',
                phoneNumber: '$phoneNumber',
              },
              totalDebt: { $sum: '$totalDebt' },
              totalPaid: { $sum: '$totalPaid' },
              totalAmount: { $sum: '$rawMaterialTotalPrice' },
            },
          },
          {
            $project: {
              _id: 0,
              supplierName: '$_id.supplierName',
              phoneNumber: '$_id.phoneNumber',
              totalDebt: 1,
              totalPaid: 1,
              totalAmount: 1,
            },
          },
          { $sort: { totalDebt: -1 } },
        ]);

        return {
          orders: orderStats,
          expenses: enhancedExpenseStats,
          sharings: sharingStats,
          rawMaterials: rawMaterialStats,
          customersWithDebt,
          suppliersWithDebt,
          totalOrders,
          totalExpenses,
          totalSharings,
          totalRawMaterials,
          totalOrderExpenses,

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
