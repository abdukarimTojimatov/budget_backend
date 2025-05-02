const incomeTypeDef = `#graphql
  type Income {
    _id: ID!
    userId: User!
    description: String!
    category: Category
    amount: Float!
    date: String
    recurring: Boolean
    recurringPeriod: String
    receiptMethod: String
    notes: String
    attachments: [String]
    createdAt: String
    updatedAt: String
  }

  type PaginatedIncomes {
    docs: [Income]
    totalDocs: Int
    limit: Int
    totalPages: Int
    page: Int
    hasPrevPage: Boolean
    hasNextPage: Boolean
  }

  extend type Query {
    getIncomes(page: Int, limit: Int, categoryId: ID, startDate: String, endDate: String, recurring: Boolean): PaginatedIncomes
    getIncome(id: ID!): Income
    categoryStatisticsIncome: [CategoryStatistics]
    getRecurringIncomes: [Income]
  }

  extend type Mutation {
    createIncome(input: CreateIncomeInput!): Income
    updateIncome(input: UpdateIncomeInput!): Income
    deleteIncome(id: ID!): ID
  }

  input CreateIncomeInput {
    description: String!
    category: ID!
    amount: Float!
    receiptMethod: String!
    date: String
    recurring: Boolean
    recurringPeriod: String
    notes: String
    attachments: [String]
  }

  input UpdateIncomeInput {
    _id: ID!
    description: String
    category: ID
    amount: Float
    receiptMethod: String
    date: String
    recurring: Boolean
    recurringPeriod: String
    notes: String
    attachments: [String]
  }
`;

export default incomeTypeDef;
