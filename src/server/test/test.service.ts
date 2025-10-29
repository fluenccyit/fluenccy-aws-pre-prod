import Knex from 'knex';
import mockKnex, { Tracker } from 'mock-knex';
import { ApolloServer } from 'apollo-server-express';
import { authService, dbService } from '@server/common';
import { typeDefs, resolvers } from '../app.schema';
import { MOCK_USER } from '@server/user/__tests__/user.mocks';

class TestService {
  private _dbTracker: Tracker | undefined;

  setupMockApolloServer = () => {
    this.setupMockAuthService();

    return new ApolloServer({ typeDefs, resolvers });
  };

  setupMockAuthService = () => {
    authService.verifyToken = jest.fn().mockReturnValue(Promise.resolve({ uid: MOCK_USER.firebaseUid }));
  };

  setupMockDb = () => {
    dbService.init({ client: 'pg' });

    mockKnex.mock(dbService._knex as Knex);

    this._dbTracker = mockKnex.getTracker();
    this._dbTracker.install();
  };

  setDbResponse(mocks: any) {
    this._dbTracker?.on('query', ({ response }) => response([mocks.shift()]));
  }

  setDbError = () => {
    this._dbTracker?.on('query', ({ reject }) => reject('Database error.'));
  };

  getDbTracker = () => {
    if (!this._dbTracker) {
      throw new Error('DB Tracker not initialised');
    }

    return this._dbTracker;
  };

  tearDownMockDb = () => {
    this._dbTracker?.uninstall();
    mockKnex.unmock(dbService._knex as Knex);
  };
}

export const testService = new TestService();
