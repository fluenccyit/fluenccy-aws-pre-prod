import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { invoiceDbUpdaters } from '@server/invoice';
import { ERROR_MESSAGE } from '@server/common';
import { MOCK_INVOICE_DBO } from './invoice.mocks';

describe('@server/invoice | invoiceDbUpdaters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#updateInvoice', () => {
    const { updateInvoice } = invoiceDbUpdaters;

    it('should update entry in the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('update "invoice"');
        done();
      });

      updateInvoice(MOCK_INVOICE_DBO);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(updateInvoice(MOCK_INVOICE_DBO)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
