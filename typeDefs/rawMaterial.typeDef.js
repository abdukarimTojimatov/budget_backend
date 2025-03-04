const rawMaterialTypeDef = `#graphql
type RawMaterial {
  _id: ID!
  userId: ID!
  customerName: String!
  phoneNumber: String
  rawMaterialName: String!
  rawMaterialDescription: String
  rawMaterialQuantity: Float!
  unitOfMeasurement: String!
  rawMaterialPrice: Float!
  payments: [Payment]
  rawMaterialTotalPrice: Float
  rawMaterialCategory: String!
  totalPaid: Float
  totalDebt: Float
  date: String
  paymentStatus: Boolean

}

type Payment {
  paymentType: String
  amount: Float
  date: String
}

type RawMaterialStatistics {
  category: String
  totalAmount: Float
}

type PaginatedRawMaterials {
  docs: [RawMaterial]
  totalDocs: Int
  limit: Int
  totalPages: Int
  page: Int
  hasPrevPage: Boolean
  hasNextPage: Boolean
}

type Query {
  getRawMaterials(page: Int, limit: Int): PaginatedRawMaterials
  getRawMaterial(id: ID!): RawMaterial
  rawMaterialStatistics: [RawMaterialStatistics]
  getRawMaterialStatistics: [RawMaterialStatistics]
}

type Mutation {
  createRawMaterial(input: CreateRawMaterialInput!): RawMaterial
  updateRawMaterial(input: UpdateRawMaterialInput!): RawMaterial
  deleteRawMaterial(id: ID!): RawMaterial
}

input CreateRawMaterialInput {
  rawMaterialName: String
  rawMaterialDescription: String
  rawMaterialQuantity: Float
  customerName: String
  phoneNumber: String
  unitOfMeasurement: String
  rawMaterialCategory: String
  rawMaterialPrice: Float
  payments: [PaymentInput]
}

input UpdateRawMaterialInput {
  _id: ID!
  rawMaterialName: String
  customerName: String
  phoneNumber: String
  rawMaterialDescription: String
  rawMaterialQuantity: Float
  rawMaterialCategory: String
  unitOfMeasurement: String
  rawMaterialPrice: Float
  payments: [PaymentInput]
  totalPaid: Float
  totalDebt: Float
  paymentStatus: Boolean
  date: String
  rawMaterialTotalPrice: Float

}

input PaymentInput {
  paymentType: String
  amount: Float
  date: String
}`;

export default rawMaterialTypeDef;
