import { map } from 'lodash';
import { parseISO } from 'date-fns';
import { gql } from '@apollo/client';
import { apolloService } from '@client/common';
import { GqlInvoicesQuery, GqlInvoicesQueryVariables, GqlInvoicesInput, GqlInvoice } from '@graphql';

export const QUERY_INVOICES = gql`
  query Invoices($input: InvoicesInput!) {
    invoices(input: $input) {
      provider
      tenantId
      invoiceId
      invoiceNumber
      invoiceStatus
      invoiceType
      contactName
      currencyCode
      date
      dateDue
      total
      currencyRate
      amountCredited
      amountDue
      amountPaid
    }
  }
`;

export const queryInvoices = async (input: GqlInvoicesInput) => {
  const { data } = await apolloService.query<GqlInvoicesQuery, GqlInvoicesQueryVariables>({
    query: QUERY_INVOICES,
    variables: { input },
  });

  return map(data.invoices, ({ date, dateDue, ...rest }) => ({
    ...rest,
    date: parseISO(date),
    dateDue: parseISO(dateDue),
  })) as GqlInvoice[];
};
