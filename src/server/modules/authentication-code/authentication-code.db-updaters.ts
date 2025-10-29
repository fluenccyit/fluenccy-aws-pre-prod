import { dbService, errorService } from '@server/common';

class AuthenticationCodeDbUpdaters {
  async updateAuthenticationCode(email  :any, code : any) {
    try {
        await dbService.table('authentication_code').where('email',email)
        .update('code',code);
    } catch (error) {
        console.log('error ', error)
        throw errorService.handleDbError('updateAuthenticationCode', error);
    }
  }
}

export const authenticationCodeDbUpdater = new AuthenticationCodeDbUpdaters();
