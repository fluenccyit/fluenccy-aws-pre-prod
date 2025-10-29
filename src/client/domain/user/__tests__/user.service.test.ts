import { userService } from '@client/user';
import { MOCK_USER } from '../graphql/__tests__/user.mock';

describe('@client/user | userService', () => {
  describe('#getFullName', () => {
    const { getFullName } = userService;

    it('should return the full name when passed a user', () => {
      expect(getFullName(MOCK_USER)).toEqual('mock-user-first-name mock-user-last-name');
    });
  });

  describe('#getInitials', () => {
    const { getInitials } = userService;

    it('should return the first and last initials when passed a user', () => {
      expect(getInitials(MOCK_USER)).toEqual('MM');
    });
  });
});
