import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { invoiceDbCreators } from '@server/invoice';
import { MOCK_INVOICE_DBO } from './invoice.mocks';

describe('@server/invoice | invoiceDbCreators', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#createInvoice', () => {
    const { createInvoice } = invoiceDbCreators;

    it('should insert entry into the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('insert into "invoice"');
        done();
      });

      createInvoice(MOCK_INVOICE_DBO);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(createInvoice(MOCK_INVOICE_DBO)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
