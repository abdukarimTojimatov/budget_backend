const expenseCategoryTypeDef = `#graphql
  type ExpenseCategory {
    _id: ID!
    name: String!
    createdAt: String
    updatedAt: String
  }

  type PaginatedExpenseCategories {
    docs: [ExpenseCategory]
    totalDocs: Int
    limit: Int
    totalPages: Int
    page: Int
    hasPrevPage: Boolean
    hasNextPage: Boolean
  }

  extend type Query {
    getExpenseCategories: PaginatedExpenseCategories
    getExpenseCategory(id: ID!): ExpenseCategory
  }

  extend type Mutation {
    createExpenseCategory(input: CreateExpenseCategoryInput!): ExpenseCategory
    updateExpenseCategory(input: UpdateExpenseCategoryInput!): ExpenseCategory
    deleteExpenseCategory(id: ID!): ExpenseCategory
  }

  input CreateExpenseCategoryInput {
    name: String!
  }

  input UpdateExpenseCategoryInput {
    _id: ID!
    name: String!
  }
`;

export default expenseCategoryTypeDef;
