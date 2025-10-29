import { GqlUser } from '@graphql';
import { UserDbo } from '@server/user';
import { MOCK_ACCOUNT } from '@server/account/__tests__/account.mocks';

export const MOCK_USER_DBO: UserDbo = {
  id: 'mock-id',
  accountId: MOCK_ACCOUNT.id,
  firebaseUid: 'mock-firebase-uid',
  firstName: 'Mock first name',
  lastName: 'Mock last name',
  role: 'accountowner',
  tokenSet: null,
};

export const MOCK_USER: GqlUser = {
  id: MOCK_USER_DBO.id,
  accountId: MOCK_ACCOUNT.id,
  firebaseUid: MOCK_USER_DBO.firebaseUid,
  firstName: MOCK_USER_DBO.firstName,
  lastName: MOCK_USER_DBO.lastName,
  role: MOCK_USER_DBO.role,
};
