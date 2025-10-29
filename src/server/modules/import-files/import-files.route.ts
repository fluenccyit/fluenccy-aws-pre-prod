import express from 'express';
import ImportFilesController from '../import-files/import-files.controller';
import CmsImportFilesController from '../import-files/cms-import-files.controller';
const path = require('path');

const multer = require('multer');//required for get file
const storage = multer.diskStorage({
    destination: function (req: any, file: any, cb: (arg0: null, arg1: string) => void) {
        console.log(' path >>> ', path.join(__dirname, '../../../../uploads/'));
        cb(null, path.join(__dirname, '../../../../uploads/'));
    },
    filename: function (req: any, file: { originalname: { split: (arg0: string) => { (): any; new(): any; length: number; }; substring: (arg0: any, arg1: any) => string; lastIndexOf: (arg0: string) => any; length: any; }; fieldname: any; }, cb: (arg0: null, arg1: any) => void) {
        let ext = '.csv'; // default extension
        console.log('file ', file.originalname)
        if (file.originalname.split(".").length > 1) {
            // checking if there is an extension or not.
            ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
        }
        cb(null, 'file' + '-' + Date.now() + ext);
    }
});

/* defined filter */
const fileFilter = (req: any, file: { mimetype: string; }, cb: (arg0: string | null, arg1: boolean) => void) => {
    const arrMimeTypeAllowed = ['text/csv', 'application/vnd.ms-excel'];
    console.log('file.mimetype ', file.mimetype);
    if (arrMimeTypeAllowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(`File type ${file.mimetype} not allowded`, false);
    }
};

const multerUploader = multer({ storage: storage, fileFilter: fileFilter });
const multerMiddleware = multerUploader.any();

const objImportFiles = new ImportFilesController();
const cmsImportFilesObj = new CmsImportFilesController();
const routerImportFiles = express();

routerImportFiles.post('/file', (req, res) => {
    
    multerMiddleware(req, res, (error: any) => {
        /**
         * ||
            !req['files'] || !Array.isArray(req['files']) ||
            (Array.isArray(req['files']) && !req['files'].length)
         */
        if (error instanceof multer.MulterError || error ) {
            objImportFiles.sendResponse(res,
                objImportFiles.getResponseObject(null, [], false, 400, error || 'Invalid file'));
        } else {
            //objCtrlAllSuiteExecution.importOfflineReport(req, res);
            objImportFiles.importFiles(req, res);
        }
    });
});

routerImportFiles.post('/logs', (req, res) => {
    objImportFiles.getImportLogs(req, res);
});

routerImportFiles.post('/contents', (req, res) => {
    objImportFiles.getImportedContent(req, res);
});

routerImportFiles.post('/update-contents', async (req, res) => {
    const isInCMS = await cmsImportFilesObj.isCmsRequest(req);
    if (isInCMS) {
        cmsImportFilesObj.updateContents(req, res);
    } else {
        objImportFiles.updateContents(req, res);
    }
});

routerImportFiles.post('/delete-csv', (req, res) => {
    objImportFiles.deleteCSV(req, res);
});

routerImportFiles.post('/recalculate-score', (req, res) => {
    objImportFiles.recalculateScore(req, res);
});


//module.exports = routerImportFiles;
export default routerImportFiles;