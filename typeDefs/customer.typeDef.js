const customerTypeDef = `#graphql
type Customer {
  _id: ID!
  userId: ID!
  name: String!
  phoneNumber: String
  createdAt: String
  updatedAt: String
}

type PaginatedCustomers {
  docs: [Customer]
  totalDocs: Int
  limit: Int
  totalPages: Int
  page: Int
  hasPrevPage: Boolean
  hasNextPage: Boolean
}

extend type Query {
  getCustomers(page: Int, limit: Int, search: String): PaginatedCustomers
  getCustomer(id: ID!): Customer
  getCustomersDropdown: [Customer]
}

extend type Mutation {
  createCustomer(input: CreateCustomerInput!): Customer
  updateCustomer(input: UpdateCustomerInput!): Customer
  deleteCustomer(id: ID!): Customer
}

input CreateCustomerInput {
  name: String!
  phoneNumber: String
}

input UpdateCustomerInput {
  _id: ID!
  name: String!
  phoneNumber: String
}`;

export default customerTypeDef;
