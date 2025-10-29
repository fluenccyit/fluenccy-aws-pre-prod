import { parseISO } from 'date-fns';
import { apolloService } from '@client/common';
import { GqlInvoicesInput, GqlInvoicesQuery } from '@graphql';
import { queryInvoices, QUERY_INVOICES } from '@client/invoice';

const MOCK_INPUT: GqlInvoicesInput = {
  tenantId: 'mock-tenant-id',
  currency: 'USD',
  dateTo: new Date(),
};

const MOCK_INVOICES: GqlInvoicesQuery['invoices'] = [
  {
    tenantId: 'mock-tenant-id',
    invoiceId: 'mock-invoice-id',
    invoiceNumber: 'mock-invoice-number',
    invoiceStatus: 'AUTHORISED',
    invoiceType: 'ACCPAY',
    contactName: 'mock-contact-name',
    date: new Date().toISOString(),
    dateDue: new Date().toISOString(),
    total: 500.0,
    currencyCode: 'NZD',
    currencyRate: 0.7654,
    amountDue: 0,
    amountPaid: 500.0,
    amountCredited: 0,
    provider: 'xero',
  },
];

describe('Invoice | GraphQL | queryInvoices', () => {
  apolloService.query = jest.fn().mockReturnValue(Promise.resolve({ data: { invoices: MOCK_INVOICES } }));

  it('should query the currencies by tenant', async () => {
    const result = await queryInvoices(MOCK_INPUT);

    expect(apolloService.query).toBeCalledWith({ query: QUERY_INVOICES, variables: { input: MOCK_INPUT } });
    expect(result).toEqual([
      {
        ...MOCK_INVOICES[0],
        date: parseISO(MOCK_INVOICES[0].date),
        dateDue: parseISO(MOCK_INVOICES[0].dateDue),
      },
    ]);
  });
});
