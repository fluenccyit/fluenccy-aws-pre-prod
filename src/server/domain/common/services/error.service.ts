import { ApolloError } from 'apollo-server-express';
import { ERROR_MESSAGE, loggerService } from '@server/common';

class ErrorService {
  handleDbError(operation: string, error: any) {
    loggerService.error('Database error occurred. <operation> | <message>.', { operation, message: error.message });

    return new ApolloError(ERROR_MESSAGE.unknown);
  }
}

export const errorService = new ErrorService();
