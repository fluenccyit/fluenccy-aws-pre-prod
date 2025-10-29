import { GqlSupportedCurrency, GqlProvider } from '@graphql';
import { XeroInvoiceStatus, XeroInvoiceType } from '@server/xero';

type BaseEmailType = {
    
  };

export type EmailModel = BaseEmailType & {
  to: string;
  from: string;
  password: string;
  subject: string;
  body: string;
};


export type EmailDbo = BaseEmailType & {
  to: string;
  from: string;
  password: string;
  subject: string;
  body: string;
  };
