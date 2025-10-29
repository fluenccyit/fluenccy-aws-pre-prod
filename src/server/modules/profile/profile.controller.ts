import { profileDbUpdater } from './profile.db-updaters';
const { DOMAIN } = process.env;
import BaseController from '../shared/base.controller'
const fs = require("fs");

class ProfileController extends BaseController {

    constructor() {
        super(__filename);
    }

    /**
     * @summary `Edit Profile`
     * @param {any} req
     * @param {any} res
     * @memberof ProfileController
    */
    async editProfile(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }
            if ('accountId' in req.body && 'type'  in req.body && 'id' in req.body && 'firebaseUid' in req.body) {
                const arrRecords1 = await profileDbUpdater.editAccount({ id:req.body.accountId,name:req.body.name,type:req.body.type });
                const arrRecords2 = await profileDbUpdater.editUser({ id:req.body.id,firebaseUid:req.body.firebaseUid,tokenSet:req.body.tokenSet, accountId:req.body.accountId,firstName:req.body.firstName,lastName:req.body.lastName,role:req.body.role});
                let data = { "Account": arrRecords1,"User":arrRecords2};
                return this.sendResponse(res, this.getResponseObject(null, data, true, 200, "Profile Updated Successfully"));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    /**
     * @summary `Reset Password`
     * @param {any} req
     * @param {any} res
     * @memberof ProfileController
    */
     async resetPassword(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }
            if ('firebaseUid' in req.body && 'newPassword' in req.body) {
                const arrRecords = await profileDbUpdater.resetPassword(req.body.firebaseUid,req.body.newPassword);
                let data = { arrRecords};
                return this.sendResponse(res, this.getResponseObject(null, data, true, 200, "Password Reset Successful"));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

}
export default ProfileController;