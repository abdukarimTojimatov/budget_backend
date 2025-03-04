import { mergeResolvers } from '@graphql-tools/merge';
import userResolver from './user.resolver.js';
import expenseResolver from './expense.resolver.js';
import orderResolver from './order.resolver.js';
import sharingResolver from './sharing.resolver.js';
import rawMaterialResolver from './rawMaterial.resolver.js';
import dashboardResolver from './dashboard.resolver.js';

const mergedResolvers = mergeResolvers([
  userResolver,
  expenseResolver,
  orderResolver,
  sharingResolver,
  rawMaterialResolver,
  dashboardResolver,
]);
//sdf

export default mergedResolvers;
