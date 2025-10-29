import { GqlUploadLog } from '@graphql';

export type UploadDataLogs = {
  uploadId: GqlUploadLog['uploadId'];
  uploadDate: GqlUploadLog['uploadDate'];
  fileType: GqlUploadLog['fileType'];
  currentStatus: GqlUploadLog['currentStatus'];
};
