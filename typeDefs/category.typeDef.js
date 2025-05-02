const categoryTypeDef = `#graphql
  type Category {
    _id: ID!
    userId: User!
    name: String!
    type: String!
    icon: String
    color: String
    description: String
    isDefault: Boolean
    budget: Float
    isActive: Boolean
    createdAt: String
    updatedAt: String
  }

  type PaginatedCategories {
    docs: [Category]
    totalDocs: Int
    limit: Int
    totalPages: Int
    page: Int
    hasPrevPage: Boolean
    hasNextPage: Boolean
  }

  extend type Query {
    getCategories(type: String): PaginatedCategories
    getCategory(id: ID!): Category
    getExpenseCategories: PaginatedCategories
    getIncomeCategories: PaginatedCategories
  }

  extend type Mutation {
    createCategory(input: CreateCategoryInput!): Category
    updateCategory(input: UpdateCategoryInput!): Category
    deleteCategory(id: ID!): Category
  }

  input CreateCategoryInput {
    name: String!
    type: String!
    icon: String
    color: String
    description: String
    budget: Float
  }

  input UpdateCategoryInput {
    _id: ID!
    name: String
    icon: String
    color: String
    description: String
    isDefault: Boolean
    budget: Float
    isActive: Boolean
  }
`;

export default categoryTypeDef;
