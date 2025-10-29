import React from 'react';
import { Accordion } from './accordion.component';
import { ProgressWheel, Text, Badge } from '@client/common';

export default {
  title: 'Components/Accordion',
  component: Accordion,
};

const labelOne = (
  <div className="flex flex-row items-center">
    <ProgressWheel className="mr-4" total={10} completed={8} size="sm" variant="success">
      <>80%</>
    </ProgressWheel>
    <div className="flex flex-col">
      <Text>Foreign currency</Text>
      <Text className="text-green-500 mt-1">Good</Text>
    </div>
  </div>
);

const labelTwo = (
  <div className="flex flex-row items-center">
    <ProgressWheel className="mr-4" total={10} completed={2} size="sm" variant="danger">
      <>20%</>
    </ProgressWheel>
    <div className="flex flex-col">
      <Text>Accounting cost</Text>
      <Text className="text-red-500 mt-1">Bad</Text>
    </div>
  </div>
);

const expandableContent = (
  <>
    <div className="flex flex-row items-center border-b border-gray-200 py-8 w-full justify-between">
      <Text>Margin</Text>
      <Badge className="mr-6 text-md" variant="success">
        $1,700
      </Badge>
    </div>
    <div className="flex flex-row items-center border-b border-gray-200 py-8 w-full justify-between">
      <Text>Past risk</Text>
      <Badge className="mr-6 text-md" variant="success">
        $2,200,900
      </Badge>
    </div>
    <div className="flex flex-row items-center border-b border-gray-200 py-8 w-full justify-between">
      <Text>Exposure</Text>
      <Badge className="mr-6 text-md" variant="success">
        $9
      </Badge>
    </div>
  </>
);

export const Index = () => (
  <>
    <Accordion isOpenInitialValue={false} label={labelOne} className="w-1/3 mb-4">
      {expandableContent}
    </Accordion>
    <Accordion isOpenInitialValue={true} label={labelTwo} className="w-1/3">
      {expandableContent}
    </Accordion>
  </>
);
