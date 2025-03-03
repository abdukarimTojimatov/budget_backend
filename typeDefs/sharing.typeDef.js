const sharingTypeDef = `#graphql

type User {
    _id: ID!
    username: String!
  }

type Sharing {
  _id: ID!
  userId: User!
  sharingDescription: String
  sharingPaymentType: String!
  sharingAmount: Float!
  sharingCategoryType: String!
  sharingDate: String!
}

type PaginatedSharings {
  docs: [Sharing]
  totalDocs: Int
  limit: Int
  totalPages: Int
  page: Int
  hasPrevPage: Boolean
  hasNextPage: Boolean
}

type Query {
  getSharings(page: Int, limit: Int, category: String): PaginatedSharings
  getSharing(id: ID!): Sharing
  categoryStatisticsSharing: [CategoryStatistics!]
}

type Mutation {
  createSharing(input: CreateSharingInput!): Sharing!
  updateSharing(input: UpdateSharingInput!): Sharing!
  deleteSharing(sharingId: ID!): Sharing!
}

type CategoryStatistics {
  category: String!
  totalAmount: Float!
}

input CreateSharingInput {
  sharingDescription: String
  sharingPaymentType: String!
  sharingAmount: Float!
  sharingCategoryType: String!
  sharingDate: String
}

input UpdateSharingInput {
  _id: ID!
  sharingDescription: String
  sharingPaymentType: String
  sharingAmount: Float
  sharingCategoryType: String
  sharingDate: String
}`;

export default sharingTypeDef;
