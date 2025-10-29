import { dbService, errorService } from '@server/common';

class ImportFilesDbUpdaters {
  async updateContent(logId: string, content: any, isInCMS: boolean = false) {
    try {
        await dbService.table(isInCMS ? 'crm_import_logs' : 'import_logs').where({ 'id': logId }).update(content);
   } catch (error) {
        console.log('error ', error)
        throw errorService.handleDbError('updateContent', error);
    }
  }

  async deleteCSV(logId: string, isHedging: boolean, isInCMS: boolean) {
    /********* Delete files steps **********/
    // 1. Check for hedging flag
    // 2. If flag is true, delete entries from hedge_invoice table which are associated with this log entry.
    // 3. IF flag is false, delete entries from invoice and payment table which are associated with this log entry.
    try {
      if (isInCMS) {
        await dbService.table('crm_import_logs').where({ 'id': logId }).delete();
      } else {
        if( isHedging ) {
          await dbService.table('hedge_invoice').where({ 'import_log_id': logId }).delete();
        }
        // } else {
        await dbService.table('invoice').where({ 'import_log_id': logId }).delete();
        await dbService.table('payment').where({ 'import_log_id': logId }).delete();
        // }
        await dbService.table('import_logs').where({ 'id': logId }).delete();
      }
    } catch (error) {
        console.log('error ', error)
        throw errorService.handleDbError('deleteCSV', error);
    }
  }
}

export const importFilesDbUpdaters = new ImportFilesDbUpdaters();
