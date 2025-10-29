export interface ResponseModel {
    res?: any;
    status: boolean | string;
    statusCode: number,
    data: Array<any> | Object;
    message: String;
    sqlMessage?: String;
}