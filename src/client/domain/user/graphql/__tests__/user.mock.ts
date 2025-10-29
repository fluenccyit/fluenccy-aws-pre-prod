import { GqlUserQuery } from '@graphql';

export const MOCK_USER: GqlUserQuery['user'] = {
  id: 'mock-user-id',
  firebaseUid: 'mock-firebase-uid',
  firstName: 'mock-user-first-name',
  lastName: 'mock-user-last-name',
  role: 'accountowner',
};
