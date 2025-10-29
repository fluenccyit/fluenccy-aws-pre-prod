import { dbService, errorService } from '@server/common';
import { sharedUtilService } from '@shared/common/services/shared-util.service';
import { ImportFileDbo } from './import-files.model';

import { isArray } from 'lodash';

class ImportFilesDbCreators {
  async createImportFileLog(importFile: ImportFileDbo) {
    try {
      const fileWithId = {
        ...importFile,
        id: importFile.id || sharedUtilService.generateUid()
      };
      if ('is_hedging' in importFile) {
        await dbService.table('import_logs').insert(fileWithId);
      } else {
        await dbService.table('crm_import_logs').insert(fileWithId);
      }
    } catch (error) {
        console.log('error ', error)
        throw errorService.handleDbError('createOrganisationUser', error);
    }
  }
}

export const importFilesDbCreators = new ImportFilesDbCreators();
