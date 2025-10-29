import { dbService, errorService } from '@server/common';

class AuthenticationCodeDbGetters {
  async fetchAuthenticationCode(email : any) {
    try {
      const code : any = await dbService
      .table('authentication_code')
      .select('code')
      .where('email', email )
      .orderBy('updated_at', 'desc');

    return code;
    } catch (error) {
        console.log('error ', error)
        throw errorService.handleDbError('getAuthenticationCode', error);
    }
  }
}

export const authenticationCodeDbGetter = new AuthenticationCodeDbGetters();
