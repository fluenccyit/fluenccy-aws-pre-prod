import { GqlPayment, GqlInvoice } from '@graphql';

export type PaymentDetails = {
  provider: GqlPayment['provider'];
  tenantId: GqlPayment['tenantId'];
  paymentId: GqlPayment['paymentId'];
  paymentStatus: GqlPayment['paymentStatus'];
  paymentType: GqlPayment['paymentType'];
  invoiceId: GqlPayment['invoiceId'];
  currencyCode: GqlPayment['currencyCode'];
  date: GqlPayment['date'];
  amount: GqlPayment['amount'];
  maxCost: GqlPayment['maxCost'];
  maxRate: GqlPayment['maxRate'];
  minCost: GqlPayment['minCost'];
  minRate: GqlPayment['minRate'];
  actualCost: GqlPayment['actualCost'];
  contactName: GqlInvoice['contactName'];
  invoiceNumber: GqlInvoice['invoiceNumber'];
  dateRaised: Date;
  datePaid: Date;
  dateDue: Date;
  rateRaised: number;
  ratePaid: number;
  amountRaised: number;
  amountPaid: number;
  budgetCost: number;
  gainLoss: number;
  status: 'paid' | 'partial';
};

export type PaymentCostVariance = {
  date: Date;
  amount: number;
  currencyRate: number;
};
