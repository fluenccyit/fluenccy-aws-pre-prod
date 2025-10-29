import { rootTypeDef } from '@server/common';
import { userTypeDef, userResolvers } from '@server/user';
import { rateResolvers, rateTypeDef } from '@server/rate';
import { adminTypeDef, adminResolvers } from '@server/admin';
import { currencyScoreTypeDef } from '@server/currency-score';
import { uploadCSVTypeDef } from '@server/upload-csv';
import { tenantResolvers, tenantTypeDef } from '@server/tenant';
import { accountTypeDef, accountResolvers } from '@server/account';
import { invoiceResolvers, invoiceTypeDef } from '@server/invoice';
import { paymentResolvers, paymentTypeDef } from '@server/payment';
import { organisationTypeDef, organisationResolvers } from '@server/organisation';

const typeDefs = [
  accountTypeDef,
  adminTypeDef,
  currencyScoreTypeDef,
  organisationTypeDef,
  invoiceTypeDef,
  paymentTypeDef,
  rateTypeDef,
  rootTypeDef,
  tenantTypeDef,
  userTypeDef,
  uploadCSVTypeDef
];

const resolvers = {
  Query: {
    ...accountResolvers.Query,
    ...organisationResolvers.Query,
    ...invoiceResolvers.Query,
    ...paymentResolvers.Query,
    ...rateResolvers.Query,
    ...tenantResolvers.Query,
    ...userResolvers.Query,
  },
  Mutation: {
    ...accountResolvers.Mutation,
    ...adminResolvers.Mutation,
    ...organisationResolvers.Mutation,
  },
};

export { typeDefs, resolvers };
