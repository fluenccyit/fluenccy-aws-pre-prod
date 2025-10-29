import React, { useState } from 'react';
import { Toggle } from './toggle.component';

export default {
  title: 'Components/Toggle',
  component: Toggle,
};

export const Index = () => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <>
      <Toggle isChecked={isChecked} onChange={setIsChecked} />
      <Toggle onChange={setIsChecked} isDisabled />
      <Toggle onChange={setIsChecked} isChecked isDisabled />
    </>
  );
};
