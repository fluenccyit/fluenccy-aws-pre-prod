import { errorService, dbService } from '@server/common';
import { sharedUtilService } from '@shared/common/services/shared-util.service';

class EntriesDbUpdater {
  async updateEntry(orgId:string, id: string, params: object, user: object) {
    const data = {...params};
    if (params.isApproved) {
      data.reservedAmount = 0;
      data.reservedMax = 0;
      data.reservedMin = 0;
    }
    data.isApproved = false;
    try {
      const records = await dbService.table('crm_entries').returning("crm_import_log_id")
      .where('id', id)
      .update(data);
      if (params.isApproved) {
        await entriesDbUpdaters.updateFeedback('', {
          crm_import_log_id: records[0],
          crm_entry_id: id,
          reservedAmount: params.reservedAmount,
          createdBy: user.id,
          updatedBy: user.id
        });
      }
    } catch (error) {
      console.log(error)
      throw errorService.handleDbError('update crm entry', error);
    }
  }

  async updateFeedback(id: string, params: object) {
    try {
      if (id) {
        // update feedback details
        await dbService.table('crm_feedback').where('id', id).update(params);
      } else {
        await dbService.table('crm_feedback').insert({...params, id: params.id || sharedUtilService.generateUid() });
      }
    } catch (error) {
      console.log(error)
      throw errorService.handleDbError('update crm feedback', error);
    }
  }
}

export const entriesDbUpdaters = new EntriesDbUpdater();
