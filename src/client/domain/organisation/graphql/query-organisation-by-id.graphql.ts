import { gql } from '@apollo/client';
import { apolloService, loggerService } from '@client/common';
import { ORGANISATION_CORE_FIELDS_FRAGMENT } from './organisation-fragment.graphql';
import { GqlByIdInput, GqlOrganisationByIdQuery, GqlOrganisationByIdQueryVariables } from '@graphql';
import { CURRENCY_SCORE_CORE_FIELDS_FRAGMENT } from '../../currency-score/graphql/currency-score-fragment.graphql';

export const QUERY_ORGANISATION_BY_ID = gql`
  ${CURRENCY_SCORE_CORE_FIELDS_FRAGMENT}
  ${ORGANISATION_CORE_FIELDS_FRAGMENT}

  query OrganisationById($input: ByIdInput!) {
    organisationById(input: $input) {
      ...CoreOrganisationFields
      currencyScores {
        ...CoreCurrencyScoreFields
      }
      account {
        id
        type
        name
      }
      primaryUser {
        firstName
        lastName
      }
    }
  }
`;

export const queryOrganisationById = async (input: GqlByIdInput) => {
  loggerService.debug('[queryOrganisationById] Query organisation by id.');

  const { data } = await apolloService.query<GqlOrganisationByIdQuery, GqlOrganisationByIdQueryVariables>({
    query: QUERY_ORGANISATION_BY_ID,
    variables: { input },
    fetchPolicy: 'network-only',
  });

  return data.organisationById;
};
