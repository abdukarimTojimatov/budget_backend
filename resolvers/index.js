import { mergeResolvers } from '@graphql-tools/merge';
import userResolver from './user.resolver.js';
import expenseResolver from './expense.resolver.js';
import expenseCategoryResolver from './expenseCategory.resolver.js';
import orderResolver from './order.resolver.js';
import sharingResolver from './sharing.resolver.js';
import rawMaterialResolver from './rawMaterial.resolver.js';
import dashboardResolver from './dashboard.resolver.js';
import employeeResolver from './employee.resolver.js';
import customerResolver from './customer.resolver.js';

const mergedResolvers = mergeResolvers([
  userResolver,
  expenseResolver,
  expenseCategoryResolver,
  orderResolver,
  sharingResolver,
  rawMaterialResolver,
  dashboardResolver,
  employeeResolver,
  customerResolver,
]);

export default mergedResolvers;
