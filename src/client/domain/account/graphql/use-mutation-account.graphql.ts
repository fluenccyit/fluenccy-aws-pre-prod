import { gql, useMutation } from '@apollo/client';
import { GqlSignUpMutation, GqlSignUpMutationVariables } from '@graphql';

const MUTATION_SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      firstName
      lastName
    }
  }
`;

export const useMutationAccount = () => {
  const [signUp] = useMutation<GqlSignUpMutation, GqlSignUpMutationVariables>(MUTATION_SIGN_UP);

  return { signUp };
};
