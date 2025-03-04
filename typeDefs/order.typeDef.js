const orderTypeDef = `#graphql
type Order {
  _id: ID!
  userId: ID!
  orderName: String!
  orderCustomerName: String!
  orderCustomerPhoneNumber: String
  orderDescription: String
  orderCategory: String!
  orderType: String!
  orderPaymentStatus: String!
  orderTotalAmount: Float!
  orderExpensesAmount: Float
  orderTotalPaid: Float
  orderTotalDebt: Float
  orderExpensesDescription: String
  orderLocation: String
  orderReadyDate: String
  date: String
  orderAutoNumber: String
  orderStatus: String!
  orderPayments: [Payment]
}

type Payment {
  paymentType: String
  amount: Float
  date: String
}

type OrderStatistics {
  orderCategory: String
  orderTotalAmount: Float
}

type PaginatedOrders {
  docs: [Order]          # Array of Order objects
  totalDocs: Int        # Total number of orders
  limit: Int            # Limit of orders per page
  totalPages: Int       # Total number of pages
  page: Int             # Current page number
  hasPrevPage: Boolean   # Indicates if there is a previous page
  hasNextPage: Boolean   # Indicates if there is a next page
}

input OrderFilterInput {
  orderCategory: String
  orderStatus: String
  orderType: String
  orderPaymentStatus: String
}

type Query {
  getOrders(page: Int,limit: Int,orderCategory: String,orderStatus: String,orderType: String,orderPaymentStatus: String): PaginatedOrders
  getOrder(id: ID!): Order
  orderStatistics: [OrderStatistics]
}

type Mutation {
  createOrder(input: CreateOrderInput!): Order
  updateOrder(input: UpdateOrderInput!): Order
  deleteOrder(id: ID!): Order
}

input CreateOrderInput {
  orderName: String!
  orderCustomerName: String!
  orderCustomerPhoneNumber: String
  orderDescription: String
  orderCategory: String!
  orderType: String!
  orderTotalAmount: Float!
  orderExpensesAmount: Float
  orderExpensesDescription: String
  orderLocation: String
  orderReadyDate: String
}


input UpdateOrderInput {
  _id: ID!
  orderName: String
  orderCustomerName: String
  orderCustomerPhoneNumber: String
  orderDescription: String
  orderCategory: String
  orderType: String
  orderTotalAmount: Float
  orderExpensesAmount: Float
  orderExpensesDescription: String
  orderLocation: String
  orderReadyDate: String
  orderPayments: [PaymentInput]  
  orderStatus: String
  orderPaymentStatus: String
  orderTotalPaid: Float
  orderTotalDebt: Float

}

input PaymentInput {
  paymentType: String
  amount: Float
  date: String
}
`;

export default orderTypeDef;
