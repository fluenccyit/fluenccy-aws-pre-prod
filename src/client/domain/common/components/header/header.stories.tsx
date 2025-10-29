import React from 'react';
import { Header } from './header.component';
import { Text } from '../text/text.component';

export default {
  title: 'Components/Header',
  component: Header,
};

export const Dark = () => (
  <Header>
    <Text variant="light">Default dark header</Text>
  </Header>
);

export const Light = () => (
  <Header variant="light">
    <Text>This is a light header</Text>
  </Header>
);
