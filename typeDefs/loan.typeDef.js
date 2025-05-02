const loanTypeDef = `#graphql
  type Loan {
    _id: ID!
    userId: User!
    paymentMethodOnGivingLoan: String!
    nameOfLoan: String!
    phoneNumberOfLoan: String!
    totalLoan: Float!
    paidLoan: Float
    leftLoan: Float
    isPaidFull: Boolean
    startDate: String!
    dueDate: String!
    attachments: [String]
    notes: String
    createdAt: String
    updatedAt: String
    paidLoans: [PaidLoanInfo]
  }

  type PaidLoanInfo {
    _id: ID
    paidAmount: Float
    paymentDate: String
    paymentMethod: String
    notes: String
    attachments: [String]
  }

  type PaginatedLoans {
    docs: [Loan]
    totalDocs: Int
    limit: Int
    totalPages: Int
    page: Int
    hasPrevPage: Boolean
    hasNextPage: Boolean
  }

  extend type Query {
    getLoans(page: Int, limit: Int, isPaidFull: Boolean): PaginatedLoans
    getLoan(id: ID!): Loan
    getUpcomingLoanRepayments(days: Int): [Loan]
    getLoanStatistics: LoanStatistics
  }

  type LoanStatistics {
    totalLoaned: Float
    paidLoans: Float
    activeLoans: Float
  }

  extend type Mutation {
    createLoan(input: CreateLoanInput!): Loan
    updateLoan(input: UpdateLoanInput!): Loan
    deleteLoan(id: ID!): ID
    addLoanPayment(input: AddLoanPaymentInput!): Loan
    updateLoanPayment(input: UpdateLoanPaymentInput!): Loan
    deleteLoanPayment(loanId: ID!, paymentId: ID!): Loan
  }

  input CreateLoanInput {
    paymentMethodOnGivingLoan: String!
    nameOfLoan: String!
    phoneNumberOfLoan: String!
    totalLoan: Float!
    startDate: String!
    dueDate: String!
    attachments: [String]
    notes: String
  }

  input UpdateLoanInput {
    _id: ID!
    paymentMethodOnGivingLoan: String
    nameOfLoan: String
    phoneNumberOfLoan: String
    totalLoan: Float
    startDate: String
    dueDate: String
    isPaidFull: Boolean
    attachments: [String]
    notes: String
  }

  input AddLoanPaymentInput {
    loanId: ID!
    paidAmount: Float!
    paymentDate: String
    paymentMethod: String!
    notes: String
    attachments: [String]
  }

  input UpdateLoanPaymentInput {
    loanId: ID!
    paymentId: ID!
    paidAmount: Float
    paymentDate: String
    paymentMethod: String
    notes: String
    attachments: [String]
  }
`;

export default loanTypeDef;
