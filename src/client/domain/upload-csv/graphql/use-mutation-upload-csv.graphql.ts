// import { gql, useMutation } from '@apollo/client';

// const MUTATION_UPLOAD_FILE = gql`
//   query UploadFile($file: GqlUploadLog!) {
//     uploadFile(body: $file) {
//       filename
//       mimetype
//       encoding
//       url
//     }
//   }
// `;

// //@rest(path: "/import/file", type: "UploadFile", method: "POST", file: "body")

// export const useMutationUploadFile = () => {
//   const [uploadFile, { data, loading, error }] = useMutation(MUTATION_UPLOAD_FILE);

//   return { uploadFile };
// };
