import { dbService, errorService } from '@server/common';

class UserDbDeleters {
  async deleteUserById(id: string) {
    try {
      await dbService.table('user').where({ id }).delete();
    } catch (error) {
      throw errorService.handleDbError('deleteUserById', error);
    }
  }
}

export const userDbDeleters = new UserDbDeleters();
