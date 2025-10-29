import React from 'react';
import { ToastProvider, useToast } from './toast.provider';
import { Button } from '@client/common/components/button/button.component';
import { Text } from '@client/common/components/text/text.component';
import { Header } from '@client/common/components/header/header.component';
import { Page } from '@client/common/components/page/page.component';

export default {
  title: 'Containers/Toast',
  component: ToastProvider,
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      disable: true,
    },
  },
};

const SuccessToast = () => (
  <>
    <Text isBlock>Success!</Text>
    <Text className="text-sm" variant="gray" isBlock>
      You have successfully synced your data.
    </Text>
  </>
);

const DangerToast = () => (
  <>
    <Text isBlock>Uh oh!</Text>
    <Text className="text-sm" variant="gray" isBlock>
      Something went wrong. Please try again.
    </Text>
  </>
);

const MyComponent = () => {
  const { addToast } = useToast();

  return (
    <>
      <Button onClick={() => addToast(<SuccessToast />)}>Success</Button>
      <Button className="ml-2" onClick={() => addToast(<DangerToast />, 'danger')} variant="gray">
        Danger
      </Button>
    </>
  );
};

export const Index = () => (
  <>
    <ToastProvider>
      <Header>
        <Text variant="light">Placeholder for header</Text>
      </Header>
      <Page>
        <MyComponent />
      </Page>
    </ToastProvider>
  </>
);
