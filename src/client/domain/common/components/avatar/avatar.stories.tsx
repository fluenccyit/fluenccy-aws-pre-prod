import React from 'react';
import { action } from '@storybook/addon-actions';
import { Avatar } from './avatar.component';

export default {
  title: 'Components/Avatar',
  component: Avatar,
};

const handleClick = () => action('Clicked!');

export const Index = () => (
  <>
    <Avatar>BC</Avatar>
    <Avatar onClick={handleClick}>CL</Avatar>
  </>
);
