import { UserDbo } from '@server/user';
import { dbService, errorService } from '@server/common';

class UserDbGetters {
  async queryUser() {
    try {
      const users: UserDbo[] = await dbService.table('user').select();

      return users;
    } catch (error) {
      throw errorService.handleDbError('queryUser', error);
    }
  }

  async getUserById(id: string) {
    try {
      const [user]: UserDbo[] = await dbService.table('user').select().where({ id });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      throw errorService.handleDbError('getUserById', error);
    }
  }

  async getUserByFirebaseUid(firebaseUid: string) {
    try {
      const [user]: UserDbo[] = await dbService.table('user').select().where({ firebaseUid });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      throw errorService.handleDbError('getUserByFirebaseUid', error);
    }
  }
}

export const userDbGetters = new UserDbGetters();
