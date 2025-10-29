import React from 'react';
import { useToast } from '@client/common';
import { testService } from '@test/client';

const TOAST_CONTENT = 'render the toast';

const MockComponent = () => {
  const { addToast } = useToast();

  return (
    <div>
      <button onClick={() => addToast(TOAST_CONTENT)}>show toast</button>
    </div>
  );
};

describe('Dashboard | GraphQL | useQueryLocalChart', () => {
  describe('#addToast', () => {
    it('should render the toast notification', () => {
      const { queryByText, getByRole } = testService.render(<MockComponent />);

      getByRole('button').click();
      expect(queryByText(TOAST_CONTENT)).toBeInTheDocument();
    });
  });
});
