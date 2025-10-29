import { gql } from 'apollo-server-express';
/*
  id,
  fileType,
  content,
  review_status,
  createdBy,
  updatedBy,
  createdAt,
  updatedAt,
 */
export const uploadCSVTypeDef = gql`
  input UploadLog {
    uploadId: String!
    uploadDate: String!
    fileType: String!
    currentStatus: String!
  }
`;
