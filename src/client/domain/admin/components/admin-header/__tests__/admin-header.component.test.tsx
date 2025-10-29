import React from 'react';
import { userVar } from '@client/user';
import { GqlUserQuery } from '@graphql';
import { testService } from '@test/client';
import { AdminHeader } from '@client/admin';

const MOCK_USER: GqlUserQuery['user'] = {
  id: 'mock-id',
  firebaseUid: 'mock-firebase-uid',
  firstName: 'mock-first-name',
  lastName: 'mock-last-name',
  role: 'accountowner',
};

describe('Admin | Components | <AdminHeader />', () => {
  it('should not render when there is no local user in apollo state', () => {
    const { queryByText } = testService.render(<AdminHeader />);

    expect(queryByText('Organisations')).toBeFalsy();
  });

  it('should render when there is local user in apollo state', () => {
    userVar({ ...MOCK_USER, email: 'mock-email' });

    const { queryByText } = testService.render(<AdminHeader />);

    expect(queryByText('Organisations')).toBeTruthy();
    expect(queryByText('MM')).toBeTruthy();
  });

  it('should show the dropdown when the avatar is clicked', () => {
    userVar({ ...MOCK_USER, email: 'mock-email' });

    const { getByText, queryByText } = testService.render(<AdminHeader />);

    expect(queryByText('Log out')).toBeNull();
    getByText('MM').click();
    expect(queryByText('Log out')).toBeTruthy();
  });
});
