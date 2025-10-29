import { parseISO } from 'date-fns';
import { apolloService } from '@client/common';
import { GqlRatesInput, GqlRatesQuery } from '@graphql';
import { queryRates, QUERY_RATES } from '@client/rate';

const MOCK_INPUT: GqlRatesInput = {
  baseCurrency: 'NZD',
  tradeCurrency: 'USD',
  dateFrom: new Date(),
};

const MOCK_RATES: GqlRatesQuery['rates'] = [
  {
    date: new Date().toISOString(),
    baseCurrency: 'NZD',
    tradeCurrency: 'USD',
    open: 0.723,
    high: 0.712,
    low: 0.722,
    last: 0.721,
  },
];

describe('Rate | GraphQL | queryRates', () => {
  apolloService.query = jest.fn().mockReturnValue(Promise.resolve({ data: { rates: MOCK_RATES } }));

  it('should query rates from a date', async () => {
    const result = await queryRates(MOCK_INPUT);

    expect(apolloService.query).toBeCalledWith({ query: QUERY_RATES, variables: { input: MOCK_INPUT } });
    expect(result).toEqual([{ ...MOCK_RATES[0], date: parseISO(MOCK_RATES[0].date) }]);
  });
});
