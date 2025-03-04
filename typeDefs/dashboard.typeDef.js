const dashboardTypeDef = `#graphql
  type OrderStatisticsData {
    orderCategory: String
    orderTotalAmount: Float
  }

  type ExpenseStatisticsData {
    category: String
    totalAmount: Float
  }

  type SharingStatisticsData {
    category: String
    totalAmount: Float
  }

  type RawMaterialStatisticsData {
    category: String
    totalAmount: Float
  }

  type DashboardStatistics {
    orders: [OrderStatisticsData]
    expenses: [ExpenseStatisticsData]
    sharings: [SharingStatisticsData]
    rawMaterials: [RawMaterialStatisticsData]
    totalOrders: Float
    totalExpenses: Float
    totalSharings: Float
    totalRawMaterials: Float
    grossProfit: Float
    netProfit: Float
    totalClientDebt: Float
    totalClientPaid: Float
    totalRawMaterialDebt: Float
    totalRawMaterialPaid: Float
    startDate: String
    endDate: String
  }

  extend type Query {
    dashboardStatistics(startDate: String, endDate: String): DashboardStatistics
  }
`;

export default dashboardTypeDef;
