import { gql, useMutation } from '@apollo/client';
import {
  GqlAdminCreateSuperuserMutation,
  GqlAdminCreateSuperuserMutationVariables,
  GqlAdminInviteUsersMutation,
  GqlAdminInviteUsersMutationVariables,
} from '@graphql';

export const MUTATION_ADMIN_CREATE_SUPERUSER = gql`
  mutation AdminCreateSuperuser($input: AdminCreateSuperuserInput!) {
    adminCreateSuperuser(input: $input)
  }
`;

export const MUTATION_ADMIN_INVITE_USERS = gql`
  mutation AdminInviteUsers($input: AdminInviteUsersInput!) {
    adminInviteUsers(input: $input)
  }
`;

export const useMutationAdmin = () => {
  const [adminCreateSuperuser] = useMutation<GqlAdminCreateSuperuserMutation, GqlAdminCreateSuperuserMutationVariables>(
    MUTATION_ADMIN_CREATE_SUPERUSER
  );
  const [adminInviteUsers] = useMutation<GqlAdminInviteUsersMutation, GqlAdminInviteUsersMutationVariables>(MUTATION_ADMIN_INVITE_USERS);

  return { adminCreateSuperuser, adminInviteUsers };
};
