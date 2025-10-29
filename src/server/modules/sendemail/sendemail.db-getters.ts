import { map } from 'lodash';
import { GqlSupportedCurrency } from '@graphql';
import { dbService, errorService } from '@server/common';
import { EmailDbo } from '../sendemail/sendemail.model'
import { XeroInvoiceStatus, XeroInvoiceType } from '@server/xero';

type QueryEmailParam = {
  to: string;
  from: string;
  body: string;
  dateTo: Date;
};

class SendemailDbGetters {
  async getSendEmail(orgId: string, tenantId: string) {
    try {
      const emailDbos: EmailDbo[] = await dbService.table('sendemail').select().where({ 'tenantId': tenantId }).orderBy('updated_at', 'desc');

      if (!emailDbos) {
        return null;
      }

      return emailDbos;
      
    } catch (error) {
      throw errorService.handleDbError('getSendEmail', error);
    }
  }
}

export const emailDbGetters = new SendemailDbGetters();
