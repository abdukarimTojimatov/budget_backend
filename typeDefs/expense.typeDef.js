const expenseTypeDef = `#graphql
 type User {
    _id: ID!
    username: String!
  }

  type Category {
  _id: ID!
  name: String!
  }

  type Expense {
    _id: ID!
    userId: User!
    description: String!
    paymentType: String!
    category: Category
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
  getExpenses(page: Int, limit: Int, categoryId: ID, startDate: String, endDate: String): PaginatedExpenses
  getExpense(id: ID!): Expense
  categoryStatisticsExpense: [ExpenseCategoryStatistics!]
}

type Mutation {
  createExpense(input: CreateExpenseInput!): Expense
  updateExpense(input: UpdateExpenseInput!): Expense
  deleteExpense(id: ID!): Expense
}

type ExpenseCategoryStatistics {
  category: Category!
  categoryName: String!
  totalAmount: Float!
}

input CreateExpenseInput {
  description: String
  category: ID!
  amount: Float!
  paymentType: String!
  date: String
}

input UpdateExpenseInput {
  _id: ID!
  description: String
  paymentType: String
  category: ID
  amount: Float
  date: String
}`;

export default expenseTypeDef;
