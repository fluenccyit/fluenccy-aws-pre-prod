import { map } from 'lodash';
import { parseISO } from 'date-fns';
import { gql } from '@apollo/client';
import { apolloService } from '@client/common';
import { GqlPaymentsQuery, GqlPaymentsQueryVariables, GqlPaymentsInput, GqlPayment } from '@graphql';

export const QUERY_PAYMENTS = gql`
  query Payments($input: PaymentsInput!) {
    payments(input: $input) {
      provider
      tenantId
      paymentId
      paymentStatus
      paymentType
      invoiceId
      currencyCode
      date
      amount
      currencyRate
      maxCost
      maxRate
      minCost
      minRate
      actualCost
    }
  }
`;

export const queryPayments = async (input: GqlPaymentsInput) => {
  const { data } = await apolloService.query<GqlPaymentsQuery, GqlPaymentsQueryVariables>({
    query: QUERY_PAYMENTS,
    variables: { input },
  });

  return map(data.payments, ({ date, ...rest }) => ({
    ...rest,
    date: parseISO(date),
  })) as GqlPayment[];
};
