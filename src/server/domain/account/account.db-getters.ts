import { dbService, errorService } from '@server/common';
import { AccountDbo } from '@server/account';

class AccountDbGetters {
  async queryAccount() {
    try {
      const accounts: AccountDbo[] = await dbService.table('account').select();

      return accounts;
    } catch (error) {
      throw errorService.handleDbError('queryAccount', error);
    }
  }

  async getAccountById(id: string) {
    try {
      const [account]: AccountDbo[] = await dbService.table('account').select().where({ id });

      if (!account) {
        return null;
      }

      return account;
    } catch (error) {
      throw errorService.handleDbError('getAccountById', error);
    }
  }
}

export const accountDbGetters = new AccountDbGetters();
