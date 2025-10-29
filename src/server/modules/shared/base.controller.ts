import { ResponseModel } from '../shared/response.model'
import { authService, cookieService, ERROR_CODE, loggerService } from '@server/common';
import { UserDbo, userDbGetters } from '@server/user';

const FIREBASE_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjhmYmRmMjQxZTdjM2E2NTEzNTYwNmRkYzFmZWQyYzU1MjI2MzBhODciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZmx1ZW5jY3ktZGV2IiwiYXVkIjoiZmx1ZW5jY3ktZGV2IiwiYXV0aF90aW1lIjoxNjM1MDc0NzAzLCJ1c2VyX2lkIjoiYXhvenJzS1VZQlRYSFJET2tOZnozbFFOQ0kxMiIsInN1YiI6ImF4b3pyc0tVWUJUWEhSRE9rTmZ6M2xRTkNJMTIiLCJpYXQiOjE2MzUwODM4MzQsImV4cCI6MTYzNTA4NzQzNCwiZW1haWwiOiJtYXR0LnNwZWhyQGZsdWVuY2N5LmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJtYXR0LnNwZWhyQGZsdWVuY2N5LmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.mHXlM15xwAVJakmylnXgFIy0QF5Yo7IdsLvL97q6YgOEIoOPHOHXfGazC8yrtA4CVOioVcY5_H8KlZSzqStsuH_8MTP8QHEdXMFSjkPwiPf2ojtjNzTu6rH6Va2-f92kWCmIErvMu0PMG-iE72HHsrQbnRPddqO5XsmLrS_DWAEV4rBrnuojdZ5stbozLbSN1zVZOtgRvkVuVeyhvboqwaa-jJya40qiyUMfp19ZaHvCu_r7NADAdOaGS1_IUK9Tuj9c7IS5jFdPE6EZIW8I_CkbiXRHLKzynvS21P-O7CvdnibdkF9sZ2yg2zYfjGqtgDFhdgIauWn0GmJrPMTYHA';
let { ENVIRONMENT } = process.env;

if (!ENVIRONMENT) {
  ENVIRONMENT = process.env.ENVIRONMENT;
}

class BaseController {
    
    constructor(fileName = __filename) {

    }

    // Send response to client
    sendResponse(httpResp: any, resp: ResponseModel) {
        resp.status = resp.status ? 'SUCCESS' : 'FAILURE';
        if (httpResp) {
            return httpResp.status(resp.statusCode).json(resp);
        }
    }

    // Get response structure for service to controller
    getResponseObject(objDateRange: any, data: any = [], statusFlag: boolean = true, statusCode: number = 200,  message: any = ''): ResponseModel {
        // if (Array.isArray(data) && !data.length && !message) {
        //     message = 'Data not found';
        // }
        if ((Array.isArray(data) && objDateRange) || (typeof data === 'object' && Object.keys(data).length)) {
            data = data;
        }
        
        return <ResponseModel>{
            status: statusFlag,
            statusCode: statusCode,
            message: message,
            data: data
        };
    }
    
    // First we verify that there is a user record against the firebase token uid.
    async getSessionUser(req:any){
        try{
            let firebaseToken = FIREBASE_TOKEN;
            if ('headers' in req && 'authorization' in req.headers && req.headers.authorization) {
                firebaseToken = req.headers.authorization;
                const { uid } = await authService.verifyToken(firebaseToken);
                const user = await userDbGetters.getUserByFirebaseUid(uid);
                return user;    
            } else {
                return null;
            }
        } catch (err) {
            console.log('getSessionUser err ', err)
            return null;
        }
    }

    isHedgingRequest(req:any){
        if('isHedging' in req.body && (req.body.isHedging == "true" || req.body.isHedging === true))
            return true;
        else 
            return false;
    }

    isCmsRequest(req: any) {
        if('isInCMS' in req.body && (req.body.isInCMS == "true" || req.body.isInCMS === true))
            return true;
        else 
            return false;
    }
}
export default BaseController;
