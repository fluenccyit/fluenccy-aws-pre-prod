import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { accountDbUpdaters } from '@server/account';
import { ERROR_MESSAGE } from '@server/common';
import { MOCK_ACCOUNT } from './account.mocks';

describe('@server/account | accountDbUpdaters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#updateAccount', () => {
    const { updateAccount } = accountDbUpdaters;

    it('should update entry in the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('update "account"');
        done();
      });

      updateAccount(MOCK_ACCOUNT);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(updateAccount(MOCK_ACCOUNT)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
