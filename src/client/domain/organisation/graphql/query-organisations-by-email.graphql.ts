import { gql } from '@apollo/client';
import { apolloService, loggerService } from '@client/common';
import { ORGANISATION_CORE_FIELDS_FRAGMENT } from './organisation-fragment.graphql';
import { GqlByEmailInput, GqlOrganisationsByEmailQuery, GqlOrganisationsByEmailQueryVariables } from '@graphql';

export const QUERY_ORGANISATIONS_BY_EMAIL = gql`
  ${ORGANISATION_CORE_FIELDS_FRAGMENT}

  query OrganisationsByEmail($input: ByEmailInput!) {
    organisationsByEmail(input: $input) {
      ...CoreOrganisationFields
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

export const queryOrganisationsByEmail = async (input: GqlByEmailInput) => {
  loggerService.debug('[queryOrganisationsByEmail] Query organisations by email.');

  const { data } = await apolloService.query<GqlOrganisationsByEmailQuery, GqlOrganisationsByEmailQueryVariables>({
    query: QUERY_ORGANISATIONS_BY_EMAIL,
    variables: { input },
  });

  return data.organisationsByEmail;
};
