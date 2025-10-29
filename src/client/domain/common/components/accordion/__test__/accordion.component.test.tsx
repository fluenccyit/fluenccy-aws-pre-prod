import React from 'react';
import { testService } from '@test/client';
import { Accordion, Text } from '@client/common';

describe('Common | Components | <Accordion />', () => {
  it('should render correctly with initial is open value set to true', () => {
    const { getByText } = testService.render(
      <Accordion isOpenInitialValue={true} label={'Render me!'}>
        <Text>Also, render me!</Text>
      </Accordion>
    );
    expect(getByText('Render me!')).toBeTruthy();
    expect(getByText('Also, render me!')).toBeTruthy();
  });

  it('should render correctly with initial is open value set to false', () => {
    const { queryByText } = testService.render(
      <Accordion isOpenInitialValue={false} label={'Render me!'}>
        <Text>Also, render me!</Text>
      </Accordion>
    );

    expect(queryByText('Also, render me!')).not.toBeInTheDocument();
  });
});
