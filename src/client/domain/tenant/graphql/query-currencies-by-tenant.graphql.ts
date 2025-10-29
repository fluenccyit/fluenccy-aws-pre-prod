import { gql } from '@apollo/client';
import { apolloService } from '@client/common';
import { GqlCurrenciesByTenantQuery, GqlCurrenciesByTenantQueryVariables, GqlByTenantIdInput } from '@graphql';

export const QUERY_CURRENCIES_BY_TENANT = gql`
  query CurrenciesByTenant($input: ByTenantIdInput!) {
    currenciesByTenant(input: $input)
  }
`;

export const queryCurrenciesByTenant = async (input: GqlByTenantIdInput) => {
  const { data } = await apolloService.query<GqlCurrenciesByTenantQuery, GqlCurrenciesByTenantQueryVariables>({
    query: QUERY_CURRENCIES_BY_TENANT,
    variables: { input },
  });

  return data.currenciesByTenant;
};
