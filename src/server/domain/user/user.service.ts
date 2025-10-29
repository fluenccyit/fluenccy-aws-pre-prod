import { trim } from 'lodash';
import { GqlUser } from '@graphql';
import { UserDbo } from '@server/user';

type GetDisplayNameParam = {
  firstName: string;
  lastName: string;
};

class UserService {
  getUserDisplayName = ({ firstName, lastName }: GetDisplayNameParam) => {
    return trim(`${trim(firstName)} ${trim(lastName)}`);
  };

  convertDbo = (userDbo: UserDbo): GqlUser => ({
    id: userDbo.id,
    accountId: userDbo.accountId,
    firebaseUid: userDbo.firebaseUid,
    firstName: userDbo.firstName,
    lastName: userDbo.lastName,
    role: userDbo.role,
  });
}

export const userService = new UserService();
