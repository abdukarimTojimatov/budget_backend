import { mergeTypeDefs } from '@graphql-tools/merge';

import userTypeDef from './user.typeDef.js';
import expenseTypeDef from './expense.typeDef.js';
import orderTypeDef from './order.typeDef.js';
import sharingTypeDef from './sharing.typeDef.js';
import rawMaterialTypeDef from './rawMaterial.typeDef.js';
import dashboardTypeDef from './dashboard.typeDef.js';

const mergedTypeDefs = mergeTypeDefs([
  userTypeDef,
  expenseTypeDef,
  orderTypeDef,
  sharingTypeDef,
  rawMaterialTypeDef,
  dashboardTypeDef,
]);

export default mergedTypeDefs;
