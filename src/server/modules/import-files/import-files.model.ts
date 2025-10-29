import { BaseDbo } from '@server/common';

export type ImportFileDbo = BaseDbo & {
  id: string;
  orgId: string;
  tenantId: string;
  fileType: string;
  content: any;
  field_mapping: any;
  review_status: string;
  filename: string;
  is_hedging: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
  mode?: string | null;
};
