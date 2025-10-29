import { ApolloError } from 'apollo-server-express';

type HandleAllowNullParam = {
  allowNull: boolean;
  error: string;
};

class UtilService {
  handleAllowNull = ({ allowNull, error }: HandleAllowNullParam) => {
    if (!allowNull) {
      throw new ApolloError(error);
    }

    return null;
  };

  patchObject<T, K extends keyof T>(object: T, key: K, value: T[K] | null | undefined, allowNull?: boolean) {
    if (value === null && allowNull) {
      object[key] = value as any;
    } else if (value !== undefined && value !== null) {
      object[key] = value;
    }
  }
}

export const utilService = new UtilService();
