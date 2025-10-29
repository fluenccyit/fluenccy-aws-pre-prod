import { gql } from '@apollo/client';
import { GqlOrganisationsQuery } from '@graphql';
import { apolloService, loggerService } from '@client/common';
import { ORGANISATION_CORE_FIELDS_FRAGMENT } from './organisation-fragment.graphql';

export const QUERY_ORGANISATIONS = gql`
  ${ORGANISATION_CORE_FIELDS_FRAGMENT}

  query Organisations {
    organisations {
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

export const queryOrganisations = async () => {
  loggerService.debug('[queryOrganisations] Query organisations.');

  const { data } = await apolloService.query<GqlOrganisationsQuery>({
    query: QUERY_ORGANISATIONS,
    fetchPolicy: 'network-only',
  });

  return data.organisations || [];
};
