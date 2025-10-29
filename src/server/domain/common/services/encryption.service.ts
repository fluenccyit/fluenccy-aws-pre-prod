import crypto from 'crypto';

const { ENCRYPTION_SECRET } = process.env;

type IsMatchParam = {
  hash: string;
  data: string;
};

class EncryptionService {
  generateHash(data: string) {
    return crypto.createHmac('sha256', ENCRYPTION_SECRET).update(data).digest('hex');
  }

  isMatch({ hash, data }: IsMatchParam) {
    return hash === this.generateHash(data);
  }
}

export const encryptionService = new EncryptionService();
