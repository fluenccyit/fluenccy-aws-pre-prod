import { trim } from 'lodash';
import { GqlUserQuery } from '@graphql';

class UserService {
  getFullName = ({ firstName, lastName }: GqlUserQuery['user']) => trim(`${trim(firstName)} ${trim(lastName)}`);

  getInitials = (user: GqlUserQuery['user']) => {
    const fullName = this.getFullName(user);
    const names = fullName.split(' ');

    if (!names.length || !names[0]) {
      return '?';
    }

    let initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }

    return initials;
  };
}

export const userService = new UserService();
