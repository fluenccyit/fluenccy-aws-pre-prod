import { head } from 'lodash';
import { gql } from 'apollo-server-express';
import { GqlSignUpInput } from '@graphql';
import { createTestClient } from 'apollo-server-testing';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { MOCK_USER } from '@server/user/__tests__/user.mocks';
import { MOCK_ACCOUNT } from './account.mocks';

describe('@server/account | accountResolver', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('Query', () => {
    describe('#account', () => {
      const QUERY = gql`
        query Account {
          account {
            id
            name
            type
          }
        }
      `;

      it('should return the account of the logged in user', async () => {
        testService.setDbResponse([MOCK_USER, MOCK_ACCOUNT]);

        const { query } = createTestClient(testService.setupMockApolloServer());
        const { data, errors } = await query({ query: QUERY });

        expect(errors).toBeUndefined();
        expect(data.account).toEqual(MOCK_ACCOUNT);
      });
    });
  });

  describe('Mutation', () => {
    describe('#signUp', () => {
      const MUTATION = gql`
        mutation SignUp($input: SignUpInput!) {
          signUp(input: $input) {
            firstName
            lastName
          }
        }
      `;

      const MOCK_INPUT: GqlSignUpInput = {
        firstName: 'mock-firstName',
        lastName: 'mock-lastName',
        accountName: 'mock-accountName',
        accountType: 'accountant',
        email: 'mock@email.com',
        password: 'mock-password',
      };

      it('should throw an error if a display name cannot be determined', async () => {
        const { mutate } = createTestClient(testService.setupMockApolloServer());

        const { data, errors } = await mutate({
          mutation: MUTATION,
          variables: {
            input: {
              ...MOCK_INPUT,
              firstName: ' ',
              lastName: ' ',
            },
          },
        });

        expect(errors).not.toBeUndefined();
        expect(head(errors)?.message).toEqual(ERROR_MESSAGE.invalidUsername);
        expect(data).toBeFalsy();
      });
    });
  });
});
