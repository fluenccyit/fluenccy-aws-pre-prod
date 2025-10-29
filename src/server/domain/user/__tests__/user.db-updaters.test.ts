import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { userDbUpdaters } from '@server/user';
import { ERROR_MESSAGE } from '@server/common';
import { MOCK_USER_DBO } from './user.mocks';

describe('@server/user | userDbUpdaters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#updateUser', () => {
    const { updateUser } = userDbUpdaters;

    it('should update entry in the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('update "user"');
        done();
      });

      updateUser(MOCK_USER_DBO);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(updateUser(MOCK_USER_DBO)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
