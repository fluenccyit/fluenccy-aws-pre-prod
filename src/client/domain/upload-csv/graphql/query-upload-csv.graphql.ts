import { map } from 'lodash';
import { parseISO } from 'date-fns';
import { gql } from '@apollo/client';
import { apolloService } from '@client/common';
import { GqlInvoicesQuery, GqlInvoicesQueryVariables, GqlInvoicesInput, GqlInvoice } from '@graphql';

export const QUERY_UPLOAD_CSV = gql`
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

export const queryUploadCSV = async (input: GqlInvoicesInput) => {
  const { data } = await apolloService.query<GqlInvoicesQuery, GqlInvoicesQueryVariables>({
    query: QUERY_UPLOAD_CSV,
    variables: { input },
  });

  return map(data.invoices, ({ date, dateDue, ...rest }) => ({
    ...rest,
    date: parseISO(date),
    dateDue: parseISO(dateDue),
  })) as GqlInvoice[];
};
