import React from 'react';
import { TabButton } from '@client/common';
import { testService } from '@test/client';

describe('Common | Containers | <TabButton />', () => {
  it('should throw an error if rendered outside of a TabProvider', () => {
    testService.expectToThrow(() => {
      testService.render(<TabButton id="click-me" label="Click Me!" />);
    });
  });
});
