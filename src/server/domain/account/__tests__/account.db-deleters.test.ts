import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { accountDbDeleters } from '@server/account';
import { MOCK_ACCOUNT } from './account.mocks';

describe('@server/account | accountDbDeleters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#deleteAccountById', () => {
    const { deleteAccountById } = accountDbDeleters;

    it('should delete entry from the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('delete from "account"');
        done();
      });

      deleteAccountById(MOCK_ACCOUNT.id);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(deleteAccountById(MOCK_ACCOUNT.id)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
