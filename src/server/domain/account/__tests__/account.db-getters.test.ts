import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { accountDbGetters } from '@server/account';
import { MOCK_ACCOUNT } from './account.mocks';

describe('@server/account | accountDbGetters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#queryAccount', () => {
    const { queryAccount } = accountDbGetters;

    it('should fetch all accounts from the database', async () => {
      testService.setDbResponse([MOCK_ACCOUNT]);

      expect(await queryAccount()).toEqual([MOCK_ACCOUNT]);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(queryAccount()).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });

  describe('#getAccountById', () => {
    const { getAccountById } = accountDbGetters;

    it('should fetch a single account from the database by id', async () => {
      testService.setDbResponse([MOCK_ACCOUNT]);

      expect(await getAccountById(MOCK_ACCOUNT.id)).toEqual(MOCK_ACCOUNT);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(getAccountById(MOCK_ACCOUNT.id)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
