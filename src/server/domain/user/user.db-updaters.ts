import { errorService, dbService } from '@server/common';
import { UserDbo } from '@server/user';

class UserDbUpdater {
  async updateUser(user: UserDbo) {
    try {
      const { id, firebaseUid, tokenSet, ...userToUpdate } = user;

      await dbService
        .table('user')
        .where({ id, firebaseUid })
        .update({ ...userToUpdate, tokenSet: tokenSet ? JSON.stringify(tokenSet) : null });
    } catch (error) {
      throw errorService.handleDbError('updateUser', error);
    }
  }
}

export const userDbUpdaters = new UserDbUpdater();
