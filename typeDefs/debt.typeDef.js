const debtTypeDef = `#graphql
  type Debt {
    _id: ID!
    userId: User!
    paymentMethodOnTakingDebt: String!
    nameOfDebt: String!
    phoneNumberOfDebt: String!
    totalDebt: Float!
    paidDebts: [PaidDebtInfo]
    paidDebt: Float
    leftDebt: Float
    isPaidFull: Boolean
    startDate: String!
    dueDate: String!
    attachments: [String]
    notes: String
    createdAt: String
    updatedAt: String
  }

  type PaidDebtInfo {
    _id: ID
    paidAmount: Float
    paymentDate: String
    paymentMethod: String
    notes: String
    attachments: [String]
  }

  type PaginatedDebts {
    docs: [Debt]
    totalDocs: Int
    limit: Int
    totalPages: Int
    page: Int
    hasPrevPage: Boolean
    hasNextPage: Boolean
  }

  extend type Query {
    getDebts(page: Int, limit: Int, isPaidFull: Boolean): PaginatedDebts
    getDebt(id: ID!): Debt
    getUpcomingDebtPayments(days: Int): [Debt]
    getDebtStatistics: DebtStatistics
  }

  type DebtStatistics {
    totalDebt: Float
    paidDebt: Float
    leftDebt: Float
    isPaidFull: Boolean
  }

  extend type Mutation {
    createDebt(input: CreateDebtInput!): Debt
    updateDebt(input: UpdateDebtInput!): Debt
    deleteDebt(id: ID!): ID
    addDebtPayment(input: AddDebtPaymentInput!): Debt
    updateDebtPayment(input: UpdateDebtPaymentInput!): Debt
    deleteDebtPayment(debtId: ID!, paymentIndex: Int!): Debt
  }

  input CreateDebtInput {
    paymentMethodOnTakingDebt: String!
    nameOfDebt: String!
    phoneNumberOfDebt: String!
    totalDebt: Float!
    startDate: String!
    dueDate: String!
    attachments: [String]
    notes: String
  }

  input UpdateDebtInput {
    _id: ID!
    paymentMethodOnTakingDebt: String
    nameOfDebt: String
    phoneNumberOfDebt: String
    totalDebt: Float
    isPaidFull: Boolean
    startDate: String
    dueDate: String
    attachments: [String]
    notes: String
  }

  input AddDebtPaymentInput {
    debtId: ID!
    paidAmount: Float!
    paymentDate: String!
    paymentMethod: String!
    notes: String
    attachments: [String]
  }

  input UpdateDebtPaymentInput {
    debtId: ID!
    paymentIndex: Int!
    paidAmount: Float
    paymentDate: String
    paymentMethod: String
    notes: String
    attachments: [String]
  }

  input DebtPaymentInfo {
    paidAmount: Float!
    paymentDate: String!
    paymentMethod: String!
    notes: String
    attachments: [String]
  }
`;

export default debtTypeDef;
