import { dbService, errorService } from '@server/common';

class AccountDbDeleters {
  async deleteAccountById(id: string) {
    try {
      await dbService.table('account').where({ id }).delete();
    } catch (error) {
      throw errorService.handleDbError('deleteAccountById', error);
    }
  }
}

export const accountDbDeleters = new AccountDbDeleters();
