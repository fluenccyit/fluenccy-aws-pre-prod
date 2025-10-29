import React from 'react';
import { map } from 'lodash';
import { Button } from './button.component';

export default {
  title: 'Components/Button',
  component: Button,
};

const variants = ['dark', 'gray', 'light', 'success', 'warning', 'danger', 'info', 'xero-blue'] as const;

export const Index = () => (
  <>
    <div>
      <div>
        {map(variants, (variant) => (
          <Button key={variant} className="mr-2" variant={variant}>
            {variant}
          </Button>
        ))}
      </div>
      <div className="mt-2">
        {map(variants, (variant) => (
          <Button key={variant} className="mr-2" variant={variant} isRounded>
            {variant}
          </Button>
        ))}
      </div>
      <div className="mt-2">
        {map(variants, (variant) => (
          <Button key={variant} className="mr-2" variant={variant} isDisabled>
            {variant}
          </Button>
        ))}
      </div>
      <div className="mt-2">
        {map(variants, (variant) => (
          <Button key={variant} className="mr-2" variant={variant} isRounded isDisabled>
            {variant}
          </Button>
        ))}
      </div>
    </div>

    <div className="mt-2 p-6 bg-gray-900">
      <div>
        {map(variants, (variant) => (
          <Button key={variant} className="mr-2" state="outline" variant={variant}>
            {variant}
          </Button>
        ))}
      </div>
      <div className="mt-2">
        {map(variants, (variant) => (
          <Button key={variant} className="mr-2" state="outline" variant={variant} isRounded>
            {variant}
          </Button>
        ))}
      </div>
      <div className="mt-2">
        {map(variants, (variant) => (
          <Button key={variant} className="mr-2" state="outline" variant={variant} isDisabled>
            {variant}
          </Button>
        ))}
      </div>
      <div className="mt-2">
        {map(variants, (variant) => (
          <Button key={variant} className="mr-2" state="outline" variant={variant} isRounded isDisabled>
            {variant}
          </Button>
        ))}
      </div>
    </div>

    <div className="mt-2">
      <div>
        {map(variants, (variant) => (
          <Button key={variant} className="mr-2" state="text" variant={variant}>
            {variant}
          </Button>
        ))}
      </div>
      <div className="mt-2">
        {map(variants, (variant) => (
          <Button key={variant} className="mr-2" state="text" variant={variant} isDisabled>
            {variant}
          </Button>
        ))}
      </div>
    </div>
  </>
);
