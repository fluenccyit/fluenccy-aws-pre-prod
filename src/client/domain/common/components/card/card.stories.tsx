import React from 'react';
import { Card } from './card.component';
import { CardContent } from './card-content.component';
import { CardSeparator } from './card-separator.component';

export default {
  title: 'Components/Card',
  component: Card,
};

export const Index = () => (
  <>
    <div className="w-1/2">
      <Card>
        <CardContent className="p-6">Default</CardContent>
        <CardContent className="p-6" variant="gray">
          Gray
        </CardContent>
        <CardContent className="p-6" variant="dark">
          Dark
        </CardContent>
        <CardContent className="p-6">Last</CardContent>
        <CardContent className="p-6" hasSeparator>
          Has Separator
        </CardContent>
        <CardContent className="p-6">
          With Inline
          <CardSeparator />
          Separator
        </CardContent>
      </Card>
    </div>
  </>
);
