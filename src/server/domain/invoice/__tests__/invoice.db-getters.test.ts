import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { invoiceDbGetters } from '@server/invoice';
import { MOCK_INVOICE_DBO, MOCK_INVOICE_MODEL } from './invoice.mocks';

describe('@server/invoice | invoiceDbGetters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#queryInvoice', () => {
    const { queryInvoice } = invoiceDbGetters;
    const params = {
      ...MOCK_INVOICE_DBO,
      dateTo: new Date(),
    };

    it('should fetch invoices from the database by tenant id, invoice type, currency code and date', async () => {
      testService.setDbResponse([MOCK_INVOICE_DBO]);

      expect(await queryInvoice(params)).toEqual([MOCK_INVOICE_MODEL]);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(queryInvoice(params)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });

  describe('#queryInvoiceByTenantId', () => {
    const { queryInvoiceByTenantId } = invoiceDbGetters;

    it('should fetch all invoices from the database by tenant id', async () => {
      testService.setDbResponse([MOCK_INVOICE_DBO]);

      expect(await queryInvoiceByTenantId(MOCK_INVOICE_DBO.tenantId)).toEqual([MOCK_INVOICE_MODEL]);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(queryInvoiceByTenantId(MOCK_INVOICE_DBO.tenantId)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });

  describe('#getInvoiceById', () => {
    const { getInvoiceById } = invoiceDbGetters;
    const { invoiceId, tenantId } = MOCK_INVOICE_DBO;

    it('should fetch all invoices from the database by invoice id', async () => {
      testService.setDbResponse([MOCK_INVOICE_DBO]);

      expect(await getInvoiceById({ invoiceId, tenantId })).toEqual(MOCK_INVOICE_MODEL);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(getInvoiceById({ invoiceId, tenantId })).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
