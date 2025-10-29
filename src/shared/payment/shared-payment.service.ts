import numeral from 'numeral';
import { format, isAfter, isBefore } from 'date-fns';
import { filter, find, forEach, groupBy, mean } from 'lodash';
import { SHARED_DATE_TIME_FORMAT } from '@shared/common';
import { GqlInvoice, GqlPayment, GqlRate } from '@graphql';
import { PaymentCostVariance, PaymentDetails } from '@shared/payment';

type GetPaymentDetailsParam = {
  payments: GqlPayment[];
  invoices: GqlInvoice[];
};

type GetCostVarianceParam = {
  paymentDetails: PaymentDetails;
  rates: GqlRate[];
};

type InvoicePaymentParam = {
  payment: GqlPayment;
  invoice: GqlInvoice;
};

type GetPastMarginParam = {
  payment: GqlPayment;
  rate: GqlRate;
};

type GetReturnRateParam = {
  deliveryRate: number;
  budgetRate: number;
};

class SharedPaymentService {
  getPaymentDetails = ({ payments, invoices }: GetPaymentDetailsParam) => {
    const paymentsDetails: PaymentDetails[] = [];

    forEach(payments, async (payment) => {
      const { amount: paymentAmount, actualCost, invoiceId } = payment;
      const invoice = find(invoices, (invoice) => invoice.invoiceId === invoiceId);

      if (!invoice) {
        return;
      }

      const { total: invoiceAmount } = invoice;
      const budgetCost = this.getBudgetCost({ invoice, payment });

      paymentsDetails.push({
        ...payment,
        budgetCost,
        contactName: invoice.contactName,
        dateDue: invoice.dateDue,
        dateRaised: invoice.date,
        datePaid: payment.date,
        rateRaised: invoice.currencyRate,
        ratePaid: payment.currencyRate,
        amountRaised: invoice.total,
        amountPaid: payment.amount,
        invoiceNumber: invoice.invoiceNumber,
        status: invoiceAmount === paymentAmount ? 'paid' : 'partial',
        gainLoss: payment.paymentType === 'ACCRECPAYMENT' ? numeral(actualCost).subtract(budgetCost).value() : numeral(budgetCost).subtract(actualCost).value(),
      });
    });

    return paymentsDetails;
  };

  getCostVariance = ({ paymentDetails, rates }: GetCostVarianceParam) => {
    const { dateRaised, budgetCost, rateRaised, actualCost, datePaid, ratePaid, amountPaid } = paymentDetails;
    const costVariance: PaymentCostVariance[] = [];

    // First add the amount the invoice was raised at.
    costVariance.push({ date: dateRaised, amount: budgetCost, currencyRate: rateRaised });

    // Then grab all the rates between the raised date and payment date, and calculate the cost for each day using the open rate for each day leading
    // up to the payment date.
    const invoiceRates = filter(rates, ({ date }) => isAfter(date, dateRaised) && isBefore(date, datePaid));

    forEach(invoiceRates, ({ date, open }) => {
      const amount = numeral(amountPaid).divide(open).value();

      costVariance.push({ date, amount, currencyRate: open });
    });

    // Finally add the amount that was paid.
    costVariance.push({ date: datePaid, amount: actualCost, currencyRate: ratePaid });

    return costVariance;
  };

  getBudgetCost = ({ invoice, payment }: InvoicePaymentParam) => {
    return numeral(payment.amount).divide(invoice.currencyRate).value();
  };

  getPastMargin = ({ payment, rate }: GetPastMarginParam) => {
    const avgMarketRate = mean([rate.high, rate.low]);
    const deliveryRateMargin = numeral(avgMarketRate).subtract(payment.currencyRate).value();

    return numeral(deliveryRateMargin).divide(avgMarketRate).value();
  };

  getReturnRate = ({ deliveryRate, budgetRate }: GetReturnRateParam) => {
    return numeral(deliveryRate).subtract(budgetRate).divide(budgetRate).value();
  };

  groupPaymentsByMonthYear = (payments: GqlPayment[]) => {
    return groupBy(payments, ({ date }) => format(date, SHARED_DATE_TIME_FORMAT.monthYear));
  };
}

export const sharedPaymentService = new SharedPaymentService();
