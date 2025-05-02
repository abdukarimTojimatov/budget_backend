import { mergeTypeDefs } from '@graphql-tools/merge';

// Core models
import userTypeDef from './user.typeDef.js';
import categoryTypeDef from './category.typeDef.js';
import expenseTypeDef from './expense.typeDef.js';
import incomeTypeDef from './income.typeDef.js';
import debtTypeDef from './debt.typeDef.js';
import loanTypeDef from './loan.typeDef.js';

const mergedTypeDefs = mergeTypeDefs([
  userTypeDef,
  categoryTypeDef,
  expenseTypeDef,
  incomeTypeDef,
  debtTypeDef,
  loanTypeDef,
]);

export default mergedTypeDefs;
