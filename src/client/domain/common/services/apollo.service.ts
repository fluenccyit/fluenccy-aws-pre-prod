import fetch from 'cross-fetch';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from '@apollo/client/link/context';
import { localStorageService } from './local-storage.service';
import { userQueryFields, clearLocalUser } from '@client/user/graphql/use-query-local-user.graphql';
import { adminQueryFields, clearLocalAdmin } from '@client/admin/graphql/use-query-local-admin.graphql';
import { commonQueryFields, clearLocalCommon } from '@client/common/graphql/use-query-local-common.graphql';
import { accountQueryFields, clearLocalAccount } from '@client/account/graphql/use-query-local-account.graphql';
import { chartQueryFields, clearLocalChart } from '@client/chart/graphql/use-query-local-chart.graphql';
import { organisationQueryFields, clearLocalOrganisation } from '@client/organisation/graphql/use-query-local-organisation.graphql';
import { currencyScoreQueryFields, clearLocalCurrencyScore } from '@client/currency-score/graphql/use-query-local-currency-score.graphql';
import { fxPurchasesQueryFields, clearLocalFxPurchases } from '@client/fx-purchases/graphql/use-query-local-fx-purchases.graphql';

const httpLink = new HttpLink({
  uri: '/graphql',
  fetch,
});

const uploadLink = createUploadLink({ uri: '/graphql' });

const authLink = setContext((_, { headers }) => {
  const token = localStorageService.getItem('firebase-token');

  return {
    headers: {
      ...headers,
      authorization: token || '',
    },
  };
});

export const apolloCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        ...accountQueryFields,
        ...adminQueryFields,
        ...commonQueryFields,
        ...chartQueryFields,
        ...currencyScoreQueryFields,
        ...organisationQueryFields,
        ...userQueryFields,
        ...fxPurchasesQueryFields,
      },
    },
  },
});

export const apolloService = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: apolloCache,
});

export const clearLocalApolloCache = async () => {
  await apolloService.clearStore();
  clearLocalAccount();
  clearLocalAdmin();
  clearLocalCommon();
  clearLocalCurrencyScore();
  clearLocalChart();
  clearLocalOrganisation();
  clearLocalUser();
  clearLocalFxPurchases();
};
