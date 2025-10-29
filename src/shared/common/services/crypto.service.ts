import CryptoJS from "crypto-js";
import { startCase } from "lodash";

class Encryption {
  encrypt = (value) => {
    return CryptoJS.AES.encrypt(value, "7582e86f3275426bbc7609475f2e5e2b").toString();
  };

  decrypt = (ciphertext) => {
    const bytes  = CryptoJS.AES.decrypt(ciphertext, "7582e86f3275426bbc7609475f2e5e2b");
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  getEncryptedDataByColumns = (data = [], fieldColumnData = {}, fieldsToEncrypt = []) => {
    const fieldMappedColumns = Object.values(fieldColumnData);
  
    return data.map((obj, i) => {
      fieldsToEncrypt.forEach(field => {
        try {
          if (fieldMappedColumns.includes(field)) {
            const index = fieldMappedColumns.indexOf(field);
            const keys = Object.keys(fieldColumnData);
            const column = keys[index];
            if (obj[column]) {
              obj[`encrypted${startCase(field)}`] = encryption.encrypt(obj[column]);
            }
          }
        } catch (error) {
          console.log("Error while assigning encrypted value");
        }
        
      })
      
      return obj;
    });
  }

  getDecryptedDataByColumns = (data = [], fieldColumnData = {}, fieldsToDecrypt = []) => {
    const fieldMappedColumns = Object.values(fieldColumnData);
    return data.map((obj, i) => {
      fieldsToDecrypt.forEach(field => {
        if (fieldMappedColumns.includes(field)) {
          const index = fieldMappedColumns.indexOf(field);
          const keys = Object.keys(fieldColumnData);
          const column = keys[index];
          if (obj[`encrypted${startCase(column)}`] || obj[`encrypted${startCase(field)}`]) {
            obj[column] = encryption.decrypt(obj[`encrypted${startCase(field)}`] || obj[`encrypted${startCase(column)}`]);
            delete obj[`encrypted${startCase(field)}`];
            delete obj[`encrypted${startCase(column)}`];
          }
        }
      })
      
      return obj;
    });
  }
}

export const encryption = new Encryption();
