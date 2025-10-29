import { dbService, errorService } from '@server/common';
import { sharedUtilService } from '@shared/common/services/shared-util.service';
import { UserDbo } from '@server/user';

class UserDbCreators {
  async createUser(user: UserDbo) {
    try {
      await dbService.table('user').insert({
        ...user,
        id: user.id || sharedUtilService.generateUid()
      });
    } catch (error) {
      throw errorService.handleDbError('createUser', error);
    }
  }
}

export const userDbCreators = new UserDbCreators();
