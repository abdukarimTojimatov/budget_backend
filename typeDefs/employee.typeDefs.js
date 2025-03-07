const employeeTypeDef = `#graphql
  type Employee {
    id: ID!
    name: String!
    position: String!
    phoneNumber: String
    dailyRate: Float!
    overtimeRate: Float
    isActive: Boolean!
    createdAt: String
    updatedAt: String
  }

  type Attendance {
    id: ID!
    employee: Employee!
    date: String!
    status: String!
    workHours: Float
    overtimeHours: Float
    note: String
    createdAt: String
    updatedAt: String
  }

  type SalaryPayment {
    id: ID!
    employee: Employee!
    paymentDate: String!
    workDate: String!
    regularHours: Float
    overtimeHours: Float
    regularAmount: Float!
    overtimeAmount: Float
    totalAmount: Float!
    isAdvance: Boolean!
    note: String
    createdAt: String
    updatedAt: String
  }

  type EmployeeSalaryStats {
    employee: Employee!
    totalPaid: Float!
    totalAdvance: Float!
    totalRegularHours: Float!
    totalOvertimeHours: Float!
    paymentCount: Int!
  }

  type MonthlySalaryStats {
    month: String!
    year: Int!
    totalAmount: Float!
  }

  input EmployeeInput {
    name: String!
    position: String!
    phoneNumber: String
    dailyRate: Float!
    overtimeRate: Float
    isActive: Boolean
  }

  input SalaryPaymentInput {
    employeeId: ID!
    paymentDate: String
    workDate: String!
    regularHours: Float
    overtimeHours: Float
    regularAmount: Float!
    overtimeAmount: Float
    totalAmount: Float!
    isAdvance: Boolean
    note: String
  }

  input AttendanceInput {
    employeeId: ID!
    date: String!
    status: String!
    workHours: Float
    overtimeHours: Float
    note: String
  }

  extend type Query {
    employees: [Employee!]!
    employee(id: ID!): Employee
    salaryPayments(startDate: String, endDate: String): [SalaryPayment!]!
    employeeSalaryPayments(
      employeeId: ID!
      startDate: String
      endDate: String
    ): [SalaryPayment!]!
    employeeSalaryStats(
      startDate: String
      endDate: String
    ): [EmployeeSalaryStats!]!
    monthlySalaryStats(year: Int): [MonthlySalaryStats!]!
    attendances(date: String, startDate: String, endDate: String): [Attendance!]!
    employeeAttendances(employeeId: ID!, startDate: String, endDate: String): [Attendance!]!
  }

  extend type Mutation {
    createEmployee(input: EmployeeInput!): Employee!
    updateEmployee(id: ID!, input: EmployeeInput!): Employee!
    deleteEmployee(id: ID!): Boolean!
    createSalaryPayment(input: SalaryPaymentInput!): SalaryPayment!
    updateSalaryPayment(id: ID!, input: SalaryPaymentInput!): SalaryPayment!
    deleteSalaryPayment(id: ID!): Boolean!
    createAttendance(input: AttendanceInput!): Attendance!
    updateAttendance(id: ID!, input: AttendanceInput!): Attendance!
    deleteAttendance(id: ID!): Boolean!
    bulkCreateAttendance(inputs: [AttendanceInput!]!): [Attendance!]!
  }
`;

export default employeeTypeDef;
