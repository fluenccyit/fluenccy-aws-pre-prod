import numeral from 'numeral';
import { max, maxBy, min, minBy } from 'lodash';
import { GqlSupportedCurrency } from '@graphql';
import { rateResource } from '@server/rate';
import { DATE_TIME_FORMAT, dateService } from '@server/common';
import { PaymentCosts, PaymentDbo, PaymentModel } from '@server/payment';
import { XeroProcessedInvoice, XeroProcessedPayment } from '@server/xero';

type GetPaymentCostsParam = {
  baseCurrency: GqlSupportedCurrency;
  invoice: XeroProcessedInvoice;
  payment: XeroProcessedPayment;
};

class PaymentService {
  getPaymentCosts = async ({ baseCurrency, invoice, payment }: GetPaymentCostsParam): Promise<PaymentCosts> => {
    const { date: dateFrom, currencyCode: tradeCurrency, currencyRate: rateRaised } = invoice;
    const { date: dateTo, amount, currencyRate: ratePaid } = payment;
    const rates = await rateResource.queryRateBetweenDates({ dateFrom, dateTo, baseCurrency, tradeCurrency });
    const transactionRates = [ratePaid, rateRaised];
    const highest = maxBy(rates, 'high');
    const lowest = minBy(rates, 'low');
    const maxRate = (highest?.high ? max([highest.high, ...transactionRates]) : max(transactionRates)) as number;
    const minRate = (lowest?.low ? min([lowest.low, ...transactionRates]) : min(transactionRates)) as number;

    return {
      minRate,
      maxRate,
      minCost: numeral(amount).divide(maxRate).value(),
      maxCost: numeral(amount).divide(minRate).value(),
      actualCost: numeral(amount).divide(ratePaid).value(),
    };
  };

  convertDboToModel = (paymentDbo: PaymentDbo): PaymentModel => ({
    ...paymentDbo,
    date: dateService.parseDate(paymentDbo.date, DATE_TIME_FORMAT.postgresDate),
    amount: numeral(paymentDbo.amount).value(),
    currencyRate: numeral(paymentDbo.currencyRate).value(),
    maxCost: numeral(paymentDbo.maxCost).value(),
    maxRate: numeral(paymentDbo.maxRate).value(),
    minCost: numeral(paymentDbo.minCost).value(),
    minRate: numeral(paymentDbo.minRate).value(),
    actualCost: numeral(paymentDbo.actualCost).value(),
  });
}

export const paymentService = new PaymentService();
