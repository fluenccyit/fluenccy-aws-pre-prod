import React from 'react';
import { ModalProvider, useModal } from './modal.provider';
import { Button } from '@client/common/components/button/button.component';
import { Text } from '@client/common/components/text/text.component';
import { Page } from '@client/common/components/page/page.component';
import { Icon } from '@client/common/components/icon/icon.component';

export default {
  title: 'Containers/Modal',
  component: ModalProvider,
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      disable: true,
    },
  },
};

const BasicModal = () => {
  const { closeModal } = useModal();

  return (
    <div className="p-6">
      <div className="flex">
        <div className="mr-4">
          <Icon className="text-red-500" icon="error-circle-outlined" />
        </div>
        <div>
          <Text className="text-xl" isBlock>
            Are you sure?
          </Text>
          <Text className="text-sm" variant="gray" isBlock>
            Are you sure you want to do that? If you do there&apos;s no going back...
          </Text>
          <div className="flex justify-end mt-4">
            <Button className="mr-2" onClick={closeModal} variant="dark" state="outline">
              Nope!
            </Button>
            <Button onClick={closeModal} variant="danger">
              Yes I&apos;m sure!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyComponent = () => {
  const { openModal } = useModal();

  return (
    <>
      <Button onClick={() => openModal(<BasicModal />)}>Click me!</Button>
    </>
  );
};

export const Index = () => (
  <>
    <ModalProvider>
      <Page>
        <MyComponent />
      </Page>
    </ModalProvider>
  </>
);
