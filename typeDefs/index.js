import { mergeTypeDefs } from '@graphql-tools/merge';

import userTypeDef from './user.typeDef.js';
import expenseTypeDef from './expense.typeDef.js';
import expenseCategoryTypeDef from './expenseCategory.typeDef.js';
import orderTypeDef from './order.typeDef.js';
import sharingTypeDef from './sharing.typeDef.js';
import rawMaterialTypeDef from './rawMaterial.typeDef.js';
import dashboardTypeDef from './dashboard.typeDef.js';
import employeeTypeDef from './employee.typeDefs.js';
import scalarTypeDef from './scalar.typeDef.js';
import customerTypeDef from './customer.typeDef.js';

const mergedTypeDefs = mergeTypeDefs([
  userTypeDef,
  expenseTypeDef,
  expenseCategoryTypeDef,
  orderTypeDef,
  sharingTypeDef,
  rawMaterialTypeDef,
  dashboardTypeDef,
  employeeTypeDef,
  scalarTypeDef,
  customerTypeDef,
]);

export default mergedTypeDefs;
