const expenseTypeDef = `#graphql
 type User {
    _id: ID!
    username: String!
  }

  type Expense {
    _id: ID!
    userId: User!
    description: String!
    paymentType: String!
    category: String!
    amount: Float!
    date: String
  }

type PaginatedExpenses {
  docs: [Expense]
  totalDocs: Int
  limit: Int
  totalPages: Int
  page: Int
  hasPrevPage: Boolean
  hasNextPage: Boolean
}

type Query {
  getExpenses(page: Int, limit: Int,category: String): PaginatedExpenses
  getExpense(id: ID!): Expense
  categoryStatisticsExpense: [CategoryStatistics!]
}

type Mutation {
  createExpense(input: CreateExpenseInput!): Expense
  updateExpense(input: UpdateExpenseInput!): Expense
  deleteExpense(id: ID!): Expense
}

type CategoryStatistics {
  category: String!
  totalAmount: Float!
}

input CreateExpenseInput {
  description: String
  category: String!
  amount: Float!
  paymentType: String!
  date: String
}

input UpdateExpenseInput {
  _id: ID!
  description: String
  paymentType: String
  category: String
  amount: Float
  date: String
}`;

export default expenseTypeDef;
