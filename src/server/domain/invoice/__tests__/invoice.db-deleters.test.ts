import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { invoiceDbDeleters } from '@server/invoice';
import { MOCK_INVOICE_DBO } from './invoice.mocks';

describe('@server/invoice | invoiceDbDeleters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#deleteInvoiceByInvoiceId', () => {
    const { deleteInvoiceByInvoiceId } = invoiceDbDeleters;

    it('should delete entry from the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('delete from "invoice"');
        done();
      });

      deleteInvoiceByInvoiceId(MOCK_INVOICE_DBO.invoiceId);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(deleteInvoiceByInvoiceId(MOCK_INVOICE_DBO.invoiceId)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
