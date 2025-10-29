import React from 'react';
import { map } from 'lodash';
import { Badge } from './badge.component';

export default {
  title: 'Components/Badge',
  component: Badge,
};

const variants = ['success', 'danger', 'warning', 'info', 'gray'] as const;

export const Index = () => (
  <>
    <div>
      {map(variants, (variant) => (
        <Badge key={variant} className="mr-2" variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
    <div className="mt-2">
      {map(variants, (variant) => (
        <Badge key={variant} className="mr-2" variant={variant} size="sm">
          {variant}
        </Badge>
      ))}
    </div>
    <div className="mt-2">
      {map(variants, (variant) => (
        <Badge key={variant} className="mr-2" state="solid" variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
    <div className="mt-2">
      {map(variants, (variant) => (
        <Badge key={variant} className="mr-2" state="solid" variant={variant} size="sm">
          {variant}
        </Badge>
      ))}
    </div>
  </>
);
