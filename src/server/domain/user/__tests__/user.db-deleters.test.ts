import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { userDbDeleters } from '@server/user';
import { MOCK_USER } from './user.mocks';

describe('@server/user | userDbDeleters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#deleteUserById', () => {
    const { deleteUserById } = userDbDeleters;

    it('should delete entry from the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('delete from "user"');
        done();
      });

      deleteUserById(MOCK_USER.id);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(deleteUserById(MOCK_USER.id)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
