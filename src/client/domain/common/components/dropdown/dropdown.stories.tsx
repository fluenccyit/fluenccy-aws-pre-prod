import React from 'react';
import { useAddonState } from '@storybook/client-api';
import { Button } from '../button/button.component';
import { Dropdown } from './dropdown.component';
import { DropdownContent } from './dropdown-content.component';
import { Text } from '../text/text.component';

export default {
  title: 'Components/Dropdown',
  component: Dropdown,
};

export const Basic = () => {
  const [isOpen, setIsOpen] = useAddonState('dropdown/is-open', false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Click me!</Button>
      <Dropdown isOpen={isOpen} onClickOutside={() => setIsOpen(false)}>
        This is a basic dropdown
      </Dropdown>
    </div>
  );
};

export const WithRichContent = () => {
  const [isOpen, setIsOpen] = useAddonState('dropdown/is-open', false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Click me!</Button>
      <Dropdown isOpen={isOpen} onClickOutside={() => setIsOpen(false)}>
        <DropdownContent>
          <Text isBlock>Header</Text>
          <Text className="text-sm mt-2" variant="gray" isBlock>
            This is an example of a basic dropdown header
          </Text>
        </DropdownContent>
        <DropdownContent>
          <Button className="w-full" variant="xero-blue" onClick={() => setIsOpen(false)}>
            Row with button
          </Button>
        </DropdownContent>
        <DropdownContent onClick={() => setIsOpen(false)}>Row that can be clicked</DropdownContent>
      </Dropdown>
    </div>
  );
};
