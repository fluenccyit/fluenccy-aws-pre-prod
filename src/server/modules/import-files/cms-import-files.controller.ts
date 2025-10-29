import { sharedUtilService } from '@shared/common';
import { importFilesDbUpdaters } from './import-files.db-updaters';
import BaseController from '../shared/base.controller'
import { loggerService } from '@server/common';
import { Invoice as XeroInvoice, Payment as XeroPayment } from 'xero-node';
import { invoiceDbCreators } from '@server/invoice';
import { organisationDbGetters } from '@server/organisation';

export type XeroInvoiceStatus = keyof typeof XeroInvoice.StatusEnum;
export type XeroPaymentStatus = keyof typeof XeroPayment.StatusEnum;
export type XeroInvoiceType = keyof typeof XeroInvoice.TypeEnum;
export type XeroPaymentType = keyof typeof XeroPayment.PaymentTypeEnum;

class CmsImportFilesController extends BaseController {

  constructor() {
    super(__filename);
  }

  /**
   * @summary `Update contents`
   * @param {any} req
   * @param {any} res
   * @memberof CmsImportFilesController
  */
  async updateContents(req: any, res: any) {
    try {

      if ('logId' in req.body && 'content' in req.body && 'field_mapping' in req.body && 'is_published' in req.body && 'orgId' in req.body) {
        const user = await this.getSessionUser(req);
        if (!user) {
          return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
        }
        let arrRecords;
        const isInCMS = true;

        let arrInvoiceDetails = req.body.content;
        //If is_published is true then need to import all data in invoices table
        if (req.body.is_published) {
          const objFieldMapping = req.body.field_mapping;

          const keysObj = {};

          for (let key in objFieldMapping) {
            const value = objFieldMapping[key];
            // console.log('key: ', key, ' value: ', value);
            keysObj[value] = key;
          }
          // console.log('keysObj:', keysObj)

          //Validate input madpping
          const notMapped = !keysObj.paymentMonth || !keysObj.paymentYear || !keysObj.foreignCurrencyCode || !keysObj.budgetRate || !keysObj.amount;
          if (notMapped) {
            return this.sendResponse(res, this.getResponseObject(null, [], false, 200, 'Column mapping is missing for required fields.'));
          } else {

            const organisation = await organisationDbGetters.getOrganisationById(req.body.orgId)
            arrInvoiceDetails = arrInvoiceDetails.filter(o => o[keysObj.foreignCurrencyCode] !== organisation.currency);
            const entries = [];
            await sharedUtilService.asyncForEach(arrInvoiceDetails, async (objInvoice: any) => {
              // invoiceId = sharedUtilService.generateUid('');

              const tempEntry = {
                orgId: req.body.orgId,
                month: objInvoice[keysObj.paymentMonth] || '',
                year: objInvoice[keysObj.paymentYear] || '',
                forecaseAmount: objInvoice[keysObj.amount] || 0,
                currencyCode: objInvoice[keysObj.foreignCurrencyCode] || '',
                budgetRate: objInvoice[keysObj.budgetRate] || 0,
                crm_import_log_id: req.body.logId,
                createdBy: user.id,
                updatedBy: user.id
              };
              entries.push(tempEntry);              
            });

            await this.processAndStoreEntries(entries);

            arrRecords = await importFilesDbUpdaters.updateContent(req.body.logId, { content: JSON.stringify(arrInvoiceDetails), field_mapping: JSON.stringify(req.body.field_mapping), review_status: 'Imported', updatedBy: user?.id, updated_at: new Date() }, isInCMS);
          }
        } else {
          arrRecords = await importFilesDbUpdaters.updateContent(req.body.logId, { content: JSON.stringify(arrInvoiceDetails), field_mapping: JSON.stringify(req.body.field_mapping), review_status: 'Draft Saved', updatedBy: user?.id, updated_at: new Date() }, isInCMS);
        }

        return this.sendResponse(res, this.getResponseObject(null, arrRecords, true, 200, ""));
      } else {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
      }

    } catch (err) {
      console.log("In exception");
      console.log('err ', err)
      return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
    }
  }


  async processAndStoreEntries(entries) {
    console.log(entries)
    const entriesCount = entries.length;

    if (!entriesCount) {
      loggerService.info('No entries to process.', { entriesCount });
      return;
    }

    loggerService.info('Processing and storing entries', { entriesCount });

    await sharedUtilService.asyncForEach(entries, async (entry) => {
      try {        
        await Promise.all([
          invoiceDbCreators.createCmsEntry(entry)
        ]);
      } catch (error) {
        console.log('error ', error)
        loggerService.error('Failed to process and save enttry from import files', entry);
      }
    });
  }
}

export default CmsImportFilesController;