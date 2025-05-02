const userTypeDef = `#graphql
  type User {
    _id: ID!
    username: String!
    password: String!
    phoneNumber: String!
    fullName: String
    profileImage: String
    currency: String
    language: String
    role: String
    isActive: Boolean
    lastLogin: String
    notificationPreferences: NotificationPreferences
    monthlyBudget: Float
    savingsGoal: Float
    createdAt: String
    updatedAt: String
    expenses: [Expense!]
    incomes: [Income!]
    debts: [Debt!]
    loans: [Loan!]
  }

  type NotificationPreferences {
    email: Boolean
    sms: Boolean
    push: Boolean
  }

  type Query {
    authUser: User
    user(userId: ID!): User
    users: [User!]!
    userProfile: User
  }

  type Mutation {
    signUp(input: SignUpInput!): User
    login(input: LoginInput!): User
    logout: LogoutResponse
    updateUserProfile(input: UpdateUserProfileInput!): User
    updateUserPassword(input: UpdatePasswordInput!): User
    updateUserSettings(input: UpdateUserSettingsInput!): User
  }

  input SignUpInput {
    username: String!
    password: String!
    phoneNumber: String!
    fullName: String
  }

  input LoginInput {
    phoneNumber: String!
    password: String!
  }

  input UpdateUserProfileInput {
    fullName: String
    phoneNumber: String
    profileImage: String
  }

  input UpdatePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  input UpdateUserSettingsInput {
    currency: String
    language: String
    monthlyBudget: Float
    savingsGoal: Float
    notificationPreferences: NotificationPreferencesInput
  }

  input NotificationPreferencesInput {
    email: Boolean
    sms: Boolean
    push: Boolean
  }

  type LogoutResponse {
    message: String!
  }
`;

export default userTypeDef;
