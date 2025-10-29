import numeral from 'numeral';
import { InvoiceDbo, InvoiceModel } from '@server/invoice';
import { DATE_TIME_FORMAT, dateService } from '@server/common';

class InvoiceService {
  convertDboToModel = (invoiceDbo: InvoiceDbo): InvoiceModel => ({
    ...invoiceDbo,
    date: dateService.parseDate(invoiceDbo.date, DATE_TIME_FORMAT.postgresDate),
    dateDue: dateService.parseDate(invoiceDbo.dateDue, DATE_TIME_FORMAT.postgresDate),
    total: numeral(invoiceDbo.total).value(),
    currencyRate: numeral(invoiceDbo.currencyRate).value(),
    amountCredited: numeral(invoiceDbo.amountCredited).value(),
    amountDue: numeral(invoiceDbo.amountDue).value(),
    amountPaid: numeral(invoiceDbo.amountPaid).value(),
  });
}

export const invoiceService = new InvoiceService();
