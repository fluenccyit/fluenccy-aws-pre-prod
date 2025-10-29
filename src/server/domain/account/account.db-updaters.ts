import { errorService, dbService } from '@server/common';
import { AccountDbo } from '@server/account';

class AccountDbUpdater {
  async updateAccount({ id, ...accountToUpdate }: AccountDbo) {
    try {
      await dbService.table('account').where({ id }).update(accountToUpdate);
    } catch (error) {
      throw errorService.handleDbError('updateAccount', error);
    }
  }
}

export const accountDbUpdaters = new AccountDbUpdater();
