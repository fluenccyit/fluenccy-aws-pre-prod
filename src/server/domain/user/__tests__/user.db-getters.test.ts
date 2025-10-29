import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { userDbGetters } from '@server/user';
import { MOCK_USER_DBO } from './user.mocks';

describe('@server/user | userDbGetters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#getUserById', () => {
    const { getUserById } = userDbGetters;

    it('should fetch a single user from the database by id', async () => {
      testService.setDbResponse([MOCK_USER_DBO]);

      expect(await getUserById(MOCK_USER_DBO.id)).toEqual(MOCK_USER_DBO);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(getUserById(MOCK_USER_DBO.id)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });

  describe('#getUserByFirebaseUid', () => {
    const { getUserByFirebaseUid } = userDbGetters;

    it('should fetch a single user from the database by firebase uid', async () => {
      testService.setDbResponse([MOCK_USER_DBO]);

      expect(await getUserByFirebaseUid(MOCK_USER_DBO.firebaseUid)).toEqual(MOCK_USER_DBO);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(getUserByFirebaseUid(MOCK_USER_DBO.firebaseUid)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
