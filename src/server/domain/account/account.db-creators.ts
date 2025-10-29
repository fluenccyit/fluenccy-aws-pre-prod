import { dbService, errorService } from '@server/common';
import { sharedUtilService } from '@shared/common/services/shared-util.service';
import { AccountDbo } from '@server/account';

class AccountDbCreators {
  async createAccount(account: AccountDbo) {
    try {
      await dbService.table('account').insert({
        ...account,
        id: account.id || sharedUtilService.generateUid()
      });
    } catch (error) {
      throw errorService.handleDbError('createAccount', error);
    }
  }
}

export const accountDbCreators = new AccountDbCreators();
