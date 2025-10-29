import admin from 'firebase-admin';
import { errorService } from '@server/common';
import { accountDbUpdaters } from '@server/account/account.db-updaters';
import { userDbUpdaters } from '@server/user/user.db-updaters';
import { AccountDbo } from '@server/account';
import { UserDbo } from '@server/user';

class ProfileDbUpdaters {
  async editAccount({ id, ...accountToUpdate }: AccountDbo) {
    try {
      console.log("Account Updated...")
      return await accountDbUpdaters.updateAccount({ id,...accountToUpdate })
    } catch (error) {
      throw errorService.handleDbError('updateAccount', error);
    }
  }

  async editUser({...userToUpdate}:UserDbo){
    try{
      console.log("User Updated...")
      return await userDbUpdaters.updateUser(userToUpdate);
    }catch(error){
      throw errorService.handleDbError('updateUser', error);
    }
  }

  async resetPassword(firebaseUid : any,newPassword : any){
    try{
      admin.auth().updateUser(firebaseUid,{
        password:newPassword
      }).then((userRecord)=>{
        console.log("Password Reset Successful!");
        return userRecord;
      })
    }catch(error){
      throw errorService.handleDbError('resetPassword', error);
    }
  }
}

export const profileDbUpdater = new ProfileDbUpdaters();
