import { useModal, Button, Icon, Text, useQueryLocalCommon } from '@client/common';
import React from 'react';

type Props = {
  orgId?: string;
};

export const OnboardingUploadPopupModal = ({ orgId }: Props) => {
  const { closeModal } = useModal();
  const { ui } = useQueryLocalCommon();

  return (
    <div className="p-6">
      <div className="flex">
        <div className="mr-4">
          <Icon className="text-green-500" icon="tick-circle-outlined" />
        </div>
        <div>
          <Text className="text-xl" isBlock>
            Thanks for your data
          </Text>
          <Text className="text-sm" variant="gray" isBlock>
            You will be notified once the currency score or IMS updated
          </Text>
          <div className="flex justify-end mt-4">
            <Button className="mr-2" onClick={closeModal} variant="dark" state="outline" isDisabled={ui === 'saving'}>
              Ok
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
