import { parseISO } from 'date-fns';
import { apolloService } from '@client/common';
import { GqlPaymentsInput, GqlPaymentsQuery } from '@graphql';
import { queryPayments, QUERY_PAYMENTS } from '@client/payment';

const MOCK_INPUT: GqlPaymentsInput = {
  tenantId: 'mock-tenant-id',
  currency: 'USD',
  dateFrom: new Date(),
  dateTo: new Date(),
};

const MOCK_PAYMENTS: GqlPaymentsQuery['payments'] = [
  {
    provider: 'xero',
    tenantId: 'mock-tenant-id',
    invoiceId: 'mock-invoice-id',
    paymentId: 'mock-payment-id',
    paymentStatus: 'AUTHORISED',
    paymentType: 'ACCPAYPAYMENT',
    date: new Date().toISOString(),
    currencyRate: 0.7654,
    currencyCode: 'USD',
    amount: 500.0,
    minRate: 0,
    minCost: 0,
    maxRate: 0,
    maxCost: 0,
    actualCost: 0,
  },
];

describe('Payment | GraphQL | queryPayments', () => {
  apolloService.query = jest.fn().mockReturnValue(Promise.resolve({ data: { payments: MOCK_PAYMENTS } }));

  it('should query the currencies by tenant', async () => {
    const result = await queryPayments(MOCK_INPUT);

    expect(apolloService.query).toBeCalledWith({ query: QUERY_PAYMENTS, variables: { input: MOCK_INPUT } });
    expect(result).toEqual([
      {
        ...MOCK_PAYMENTS[0],
        date: parseISO(MOCK_PAYMENTS[0].date),
      },
    ]);
  });
});
