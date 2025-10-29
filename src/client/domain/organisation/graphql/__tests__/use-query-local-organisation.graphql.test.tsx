import React from 'react';
import { testService } from '@test/client';
import { organisationVar, useQueryLocalOrganisation } from '@client/organisation';
import { MOCK_ORGANISATION } from './organisation.mock';

const MockComponent = () => {
  const { organisation } = useQueryLocalOrganisation();

  return (
    <>
      <div>{organisation?.id}</div>
      <div>{organisation?.name}</div>
      <div>{organisation?.currency}</div>
      <div>{organisation?.syncStatus}</div>
      <div>{organisation?.tokenStatus}</div>
      <div>{organisation?.tenant?.id}</div>
    </>
  );
};

describe('Account | GraphQL | useQueryLocalOrganisation', () => {
  beforeAll(() => {
    organisationVar(MOCK_ORGANISATION);
  });

  it('should query the local organisation state', () => {
    const { getByText } = testService.render(<MockComponent />);

    expect(getByText(MOCK_ORGANISATION.id)).toBeTruthy();
    expect(getByText(MOCK_ORGANISATION.name)).toBeTruthy();
    expect(getByText(MOCK_ORGANISATION.currency)).toBeTruthy();
    expect(getByText(MOCK_ORGANISATION.syncStatus as string)).toBeTruthy();
    expect(getByText(MOCK_ORGANISATION.tokenStatus as string)).toBeTruthy();
    expect(getByText(MOCK_ORGANISATION.tenant?.id as string)).toBeTruthy();
  });
});
