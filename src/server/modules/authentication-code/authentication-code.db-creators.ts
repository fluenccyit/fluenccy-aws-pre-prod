import { dbService, errorService } from '@server/common';
import { AuthenticationCodeDbo } from './authentication-code.model';

import { isArray } from 'lodash';

class AuthenticationCodeDbCreators {
  async createAuthenticationCode(authenticationCode: AuthenticationCodeDbo) {
    try {
        await dbService.table('authentication_code').insert(authenticationCode);
    } catch (error) {
        console.log('error ', error)
        throw errorService.handleDbError('createAuthenticationCode', error);
    }
  }
}

export const authenticationCodeDbCreator = new AuthenticationCodeDbCreators();
