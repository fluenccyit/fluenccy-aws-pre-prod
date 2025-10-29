import { find } from 'lodash';
import { gql, MutationFunctionOptions, useMutation } from '@apollo/client';
import { queryOrganisationsByToken } from './query-organisations-by-token.graphql';
import { LocalOrganisationType, organisationsVar, organisationVar } from './use-query-local-organisation.graphql';
import {
  GqlDeleteOrgMutation,
  GqlDeleteOrgMutationVariables,
  GqlDisconnectOrgMutation,
  GqlDisconnectOrgMutationVariables,
  GqlRecalculateOrgCurrencyScoresMutation,
  GqlRecalculateOrgCurrencyScoresMutationVariables,
  GqlRefreshOrgTokenMutation,
  GqlRefreshOrgTokenMutationVariables,
  GqlResyncOrgMutation,
  GqlResyncOrgMutationVariables,
  GqlUpdateOrgMutation,
  GqlUpdateOrgMutationVariables,
} from '@graphql';

export const MUTATION_REFRESH_ORG_TOKEN = gql`
  mutation RefreshOrgToken($input: ByOrgIdInput!) {
    refreshOrganisationToken(input: $input) {
      id
    }
  }
`;

export const MUTATION_DELETE_ORG = gql`
  mutation DeleteOrg($input: ByOrgIdInput!) {
    deleteOrganisation(input: $input)
  }
`;

export const MUTATION_DISCONNECT_ORG = gql`
  mutation DisconnectOrg($input: ByOrgIdInput!) {
    disconnectOrganisation(input: $input)
  }
`;

export const MUTATION_RESYNC_ORG = gql`
  mutation ResyncOrg($input: ByOrgIdInput!) {
    resyncOrganisation(input: $input) {
      id
    }
  }
`;

export const MUTATION_RECALCULATE_ORG_CURRENCY_SCORES = gql`
  mutation RecalculateOrgCurrencyScores($input: ByOrgIdInput!) {
    recalculateOrganisationCurrencyScores(input: $input) {
      id
    }
  }
`;

export const MUTATION_UPDATE_ORG = gql`
  mutation UpdateOrg($input: UpdateOrganisationInput!) {
    updateOrganisation(input: $input) {
      id
    }
  }
`;

export const useMutationOrganisation = () => {
  const [_updateOrg] = useMutation<GqlUpdateOrgMutation, GqlUpdateOrgMutationVariables>(MUTATION_UPDATE_ORG);
  const [deleteOrg] = useMutation<GqlDeleteOrgMutation, GqlDeleteOrgMutationVariables>(MUTATION_DELETE_ORG);
  const [disconnectOrg] = useMutation<GqlDisconnectOrgMutation, GqlDisconnectOrgMutationVariables>(MUTATION_DISCONNECT_ORG);
  const [refreshOrgToken] = useMutation<GqlRefreshOrgTokenMutation, GqlRefreshOrgTokenMutationVariables>(MUTATION_REFRESH_ORG_TOKEN);
  const [resyncOrg] = useMutation<GqlResyncOrgMutation, GqlResyncOrgMutationVariables>(MUTATION_RESYNC_ORG);
  const [recalculateOrgCurrencyScores] = useMutation<GqlRecalculateOrgCurrencyScoresMutation, GqlRecalculateOrgCurrencyScoresMutationVariables>(
    MUTATION_RECALCULATE_ORG_CURRENCY_SCORES
  );

  const updateOrg = async (args: MutationFunctionOptions<GqlUpdateOrgMutation, GqlUpdateOrgMutationVariables>) => {
    await _updateOrg(args);

    // When we update an organisation, we want to update all of the local organisations in state. So we encapsulate this update in this updateOrg
    // mutation hook, so we don't have to remember to do this throughout the app.
    const organisations = await queryOrganisationsByToken();

    organisationsVar(organisations as LocalOrganisationType[]);
    const org = find(organisations, { id: args.variables?.input.orgId });
    if (org) {
      organisationVar( org as LocalOrganisationType);
    }
  };

  return {
    deleteOrganisation: deleteOrg,
    disconnectOrganisation: disconnectOrg,
    recalculateOrganisationCurrencyScores: recalculateOrgCurrencyScores,
    refreshOrganisationToken: refreshOrgToken,
    resyncOrganisation: resyncOrg,
    updateOrganisation: updateOrg,
  };
};
