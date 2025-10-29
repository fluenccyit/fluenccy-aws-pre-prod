import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { accountDbCreators } from '@server/account';
import { MOCK_ACCOUNT } from './account.mocks';

describe('@server/account | accountDbCreators', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#createAccount', () => {
    const { createAccount } = accountDbCreators;

    it('should insert entry into the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('insert into "account"');
        done();
      });

      createAccount(MOCK_ACCOUNT);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(createAccount(MOCK_ACCOUNT)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
