import { map } from 'lodash';
import { GqlUser } from '@graphql';
import { organisationDbGetters } from '@server/organisation';
import { userDbGetters, UserDbo, userDbUpdaters, userService } from '@server/user';
import { authService, ERROR_MESSAGE, loggerService, utilService } from '@server/common';

type UpdateUserParam = {
  userId: UserDbo['id'];
  tokenSet: UserDbo['tokenSet'];
};

const resource = 'UserResource';
class UserResource {
  queryUserDbo = async () => {
    return await userDbGetters.queryUser();
  };

  queryUser = async () => {
    const userDbos = await this.queryUserDbo();

    return map(userDbos, userService.convertDbo);
  };

  async getUserById(id: string, allowNull?: false): Promise<GqlUser>;
  async getUserById(id: string, allowNull: true): Promise<GqlUser | null>;
  async getUserById(id: string, allowNull = false) {
    loggerService.info('Getting user by id.', { resource, method: 'getUserById', id });

    const userDbo = await userDbGetters.getUserById(id);

    if (!userDbo) {
      return utilService.handleAllowNull({ allowNull, error: ERROR_MESSAGE.noUser });
    }

    return userService.convertDbo(userDbo);
  }

  async getUserDboById(id: string, allowNull?: false): Promise<UserDbo>;
  async getUserDboById(id: string, allowNull: true): Promise<UserDbo | null>;
  async getUserDboById(id: string, allowNull = false) {
    loggerService.info('Getting user dbo id.', { resource, method: 'getUserDboById', id });

    const userDbo = await userDbGetters.getUserById(id);

    if (!userDbo) {
      return utilService.handleAllowNull({ allowNull, error: ERROR_MESSAGE.noUser });
    }

    return userDbo;
  }

  async getUserByToken(token: string, allowNull?: false): Promise<GqlUser>;
  async getUserByToken(token: string, allowNull: true): Promise<GqlUser | null>;
  async getUserByToken(token: string, allowNull = false) {
    const logParam = { resource, method: 'getUserByToken' };

    loggerService.info('Getting user by token', logParam);

    const { uid } = await authService.verifyToken(token);

    loggerService.info('Getting user by firebase uid', { ...logParam, uid });

    const userDbo = await userDbGetters.getUserByFirebaseUid(uid);

    if (!userDbo) {
      return utilService.handleAllowNull({ allowNull, error: ERROR_MESSAGE.noUser });
    }

    return userService.convertDbo(userDbo);
  }

  async getUserByEmail(email: string, allowNull?: false): Promise<GqlUser>;
  async getUserByEmail(email: string, allowNull: true): Promise<GqlUser | null>;
  async getUserByEmail(email: string, allowNull = false) {
    loggerService.info('Getting user by email.', { resource, method: 'getUserByEmail', email });

    const firebaseUser = await authService.getFirebaseUserEmail(email);
    const userDbo = firebaseUser ? await userDbGetters.getUserByFirebaseUid(firebaseUser.uid) : null;

    if (!userDbo) {
      return utilService.handleAllowNull({ allowNull, error: ERROR_MESSAGE.noUser });
    }

    return userService.convertDbo(userDbo);
  }

  async getOrganisationTokenUserDboByOrgId(orgId: string, allowNull?: false): Promise<UserDbo>;
  async getOrganisationTokenUserDboByOrgId(orgId: string, allowNull: true): Promise<UserDbo | null>;
  async getOrganisationTokenUserDboByOrgId(orgId: string, allowNull = false) {
    const logParam = { resource, method: 'getOrganisationTokenUserDboByOrgId', orgId };

    loggerService.info('Getting organisation token user by org id.', logParam);

    const organisationDbo = await organisationDbGetters.getOrganisationById(orgId);

    if (!organisationDbo) {
      return utilService.handleAllowNull({ allowNull, error: ERROR_MESSAGE.noOrganisation });
    }

    const { tokenUserId } = organisationDbo;
    const userDbo = tokenUserId ? await userDbGetters.getUserById(tokenUserId) : null;

    if (!userDbo) {
      return utilService.handleAllowNull({ allowNull, error: ERROR_MESSAGE.noTokenUser });
    }

    return userDbo;
  }

  async updateUser({ userId, ...args }: UpdateUserParam) {
    const logParam = { resource, method: 'updateUser', userId, args: JSON.stringify(args) };

    loggerService.info('Updating user.', logParam);

    const userDbo = await this.getUserDboById(userId);

    utilService.patchObject(userDbo, 'tokenSet', args.tokenSet, true);

    await userDbUpdaters.updateUser(userDbo);

    return await this.getUserById(userId);
  }
}

export const userResource = new UserResource();
