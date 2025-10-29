import { format, parseISO } from 'date-fns';
import { apolloService } from '@client/common';
import { SHARED_DATE_TIME_FORMAT } from '@shared/common';
import { queryForwardPoints, QUERY_FORWARD_POINTS } from '@client/rate';
import { GqlRatesInput, GqlForwardPointsQuery, GqlMonth } from '@graphql';

const today = new Date();

const MOCK_INPUT: GqlRatesInput = {
  baseCurrency: 'NZD',
  tradeCurrency: 'USD',
  dateFrom: today,
};

const MOCK_FORWARD_POINTS: GqlForwardPointsQuery['forwardPoints'] = [
  {
    date: today.toISOString(),
    year: format(today, SHARED_DATE_TIME_FORMAT.year),
    month: format(today, SHARED_DATE_TIME_FORMAT.month) as GqlMonth,
    baseCurrency: 'NZD',
    tradeCurrency: 'USD',
    forwardPoints: 0.723,
  },
];

describe('Rate | GraphQL | queryForwardPoints', () => {
  apolloService.query = jest.fn().mockReturnValue(Promise.resolve({ data: { forwardPoints: MOCK_FORWARD_POINTS } }));

  it('should query forward rates from date', async () => {
    const result = await queryForwardPoints(MOCK_INPUT);

    expect(apolloService.query).toBeCalledWith({
      query: QUERY_FORWARD_POINTS,
      variables: { input: MOCK_INPUT },
    });
    expect(result).toEqual([{ ...MOCK_FORWARD_POINTS[0], date: parseISO(MOCK_FORWARD_POINTS[0].date) }]);
  });
});
