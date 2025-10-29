import { apolloService } from '@client/common';
import { GqlByTenantIdInput, GqlCurrenciesByTenantQuery } from '@graphql';
import { queryCurrenciesByTenant, QUERY_CURRENCIES_BY_TENANT } from '@client/tenant';

const MOCK_INPUT: GqlByTenantIdInput = {
  tenantId: 'mock-tenantId',
};

const MOCK_CURRENCIES: GqlCurrenciesByTenantQuery['currenciesByTenant'] = ['NZD', 'AUD'];

describe('Tenant | GraphQL | queryCurrenciesByTenant', () => {
  apolloService.query = jest.fn().mockReturnValue(Promise.resolve({ data: { currenciesByTenant: MOCK_CURRENCIES } }));

  it('should query the currencies by tenant', async () => {
    const result = await queryCurrenciesByTenant(MOCK_INPUT);

    expect(apolloService.query).toBeCalledWith({ query: QUERY_CURRENCIES_BY_TENANT, variables: { input: MOCK_INPUT } });
    expect(result).toEqual(MOCK_CURRENCIES);
  });
});
