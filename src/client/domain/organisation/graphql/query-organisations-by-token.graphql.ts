import { gql } from '@apollo/client';
import { GqlByPaymentTypeInput, GqlOrganisationsByPaymentTypeQueryVariables, GqlOrganisationsByTokenQuery } from '@graphql';
import { apolloService, loggerService } from '@client/common';
import { ORGANISATION_CORE_FIELDS_FRAGMENT } from './organisation-fragment.graphql';
import { CURRENCY_SCORE_CORE_FIELDS_FRAGMENT } from '../../currency-score/graphql/currency-score-fragment.graphql';

export const QUERY_ORGANISATIONS_BY_TOKEN = gql`
  ${CURRENCY_SCORE_CORE_FIELDS_FRAGMENT}
  ${ORGANISATION_CORE_FIELDS_FRAGMENT}

  query OrganisationsByToken($input: ByPaymentTypeInput) {
    organisationsByToken(input: $input) {
      ...CoreOrganisationFields
      currencyScores {
        ...CoreCurrencyScoreFields
      }
    }
  }
`;

export const queryOrganisationsByToken = async (input: GqlByPaymentTypeInput) => {
  loggerService.debug('[queryOrganisationsByToken] Query organisations by token.');

  const { data } = await apolloService.query<GqlOrganisationsByTokenQuery, GqlOrganisationsByPaymentTypeQueryVariables>({
    query: QUERY_ORGANISATIONS_BY_TOKEN,
    variables: { input },
    // We want to avoid the cache when querying organisations, so when the user disconnects an org, we don't have a local copy of the org which causes
    // problems on the client.
    fetchPolicy: 'no-cache',
  });

  return data.organisationsByToken || [];
};
