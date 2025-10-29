import { BaseDbo } from '@server/common';
import { Tracing } from 'trace_events';

export type FinancialProductDbo = BaseDbo & {
  id: string;
  orgId:string;
  title: string;
};
