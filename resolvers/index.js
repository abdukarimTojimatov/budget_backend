import { mergeResolvers } from '@graphql-tools/merge';
import userResolver from './user.resolver.js';
import categoryResolver from './category.resolver.js';
import expenseResolver from './expense.resolver.js';
import incomeResolver from './income.resolver.js';
import debtResolver from './debt.resolver.js';
import loanResolver from './loan.resolver.js';

const mergedResolvers = mergeResolvers([
  userResolver,
  categoryResolver,
  expenseResolver,
  incomeResolver,
  debtResolver,
  loanResolver,
]);

export default mergedResolvers;
