import { map } from 'lodash';
import { GqlSupportedCurrency } from '@graphql';
import { dbService, errorService } from '@server/common';
import { InvoiceDbo, invoiceService } from '@server/invoice';
import { XeroInvoiceStatus, XeroInvoiceType } from '@server/xero';
import { ImportFileDbo } from './import-files.model';

class ImportFilesDbGetters {
  async getImportLogs(orgId:string, tenantId: string, is_hedging:boolean, isInCMS:boolean, mode: string | null = null) {
    try {
      let importLogsDbos: ImportFileDbo[];
      if (isInCMS) {
        importLogsDbos = await dbService
        .table('crm_import_logs')
        .select('id', 'fileType', 'filename', 'review_status', 'createdBy', 'updatedBy', 'created_at', 'updated_at')
        .where("orgId", orgId )
        // .where("mode", mode)
        .orderBy('updated_at', 'desc');
      } else {
        importLogsDbos = await dbService
        .table('import_logs')
        .select('id', 'fileType', 'filename', 'review_status', 'createdBy', 'updatedBy', 'created_at', 'updated_at')
        .where("orgId", orgId )
        .where("mode", mode)
        .andWhere("is_hedging", is_hedging)
        .orderBy('updated_at', 'desc');
      }

      return importLogsDbos;
    } catch (error) {
      console.log('error ', error)
      throw errorService.handleDbError('getImportLogs', error);
    }
  }

  async getImportedContent(logId: string, isInCMS: boolean = false) {
    try {
      const tableName = isInCMS ? 'crm_import_logs' : 'import_logs';
      var fields = ['content','field_mapping', 'filename','review_status', 'created_at', 'updated_at'];
      if( !isInCMS ) {
        fields.push('mode');
      }
      const importLogsDbos: ImportFileDbo[] = await dbService
        .table(tableName)
        .select(fields)
        .where('id', logId);

      return importLogsDbos;
    } catch (error) {
      console.log('error ', error)
      throw errorService.handleDbError('getImportedContent', error);
    }
  }

}

export const importFilesDbGetters = new ImportFilesDbGetters();
