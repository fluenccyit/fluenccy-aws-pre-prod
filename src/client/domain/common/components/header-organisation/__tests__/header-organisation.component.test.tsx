import React from 'react';
import { testService } from '@test/client';
import { HeaderOrganisation } from '@client/common';
import { organisationVar } from '@client/organisation';
import { MOCK_ORGANISATION } from '@client/organisation/graphql/__tests__/organisation.mock';

describe('Common | Components | <HeaderOrganisation />', () => {
  it('should render correctly', () => {
    organisationVar(MOCK_ORGANISATION);

    const { getByText } = testService.render(<HeaderOrganisation />);

    expect(getByText(MOCK_ORGANISATION.name)).toBeTruthy();
  });
});
