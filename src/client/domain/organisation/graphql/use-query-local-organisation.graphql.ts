import { gql, makeVar, useQuery } from '@apollo/client';
import { GqlOrganisationByIdQuery, GqlOrganisationsByTokenQuery, GqlSupportedCurrency } from '@graphql';

export type LocalOrganisationType = GqlOrganisationsByTokenQuery['organisationsByToken'][number] & {
  currency: GqlSupportedCurrency;
};

export type LocalAdminOrganisationType = GqlOrganisationByIdQuery['organisationById'] & {
  currency: GqlSupportedCurrency;
};

type LocalQuery = {
  localOrganisation: LocalOrganisationType | null;
  localOrganisations: LocalOrganisationType[];
};

export const QUERY_LOCAL_ORGANISATION = gql`
  query LocalOrganisation {
    localOrganisation @client
    localOrganisations @client
  }
`;

export const organisationVar = makeVar<LocalQuery['localOrganisation']>(null);
export const organisationsVar = makeVar<LocalQuery['localOrganisations']>([]);

export const organisationQueryFields = {
  localOrganisation: {
    read: () => organisationVar(),
  },
  localOrganisations: {
    read: () => organisationsVar(),
  },
};

export const useQueryLocalOrganisation = () => {
  const { data } = useQuery<LocalQuery>(QUERY_LOCAL_ORGANISATION);

  return {
    organisation: data?.localOrganisation || null,
    organisations: data?.localOrganisations || null,
  };
};

export const clearLocalOrganisation = () => {
  organisationVar(null);
  organisationsVar([]);
};
