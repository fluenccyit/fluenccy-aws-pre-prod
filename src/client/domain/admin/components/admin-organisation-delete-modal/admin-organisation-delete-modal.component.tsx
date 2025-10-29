import { ADMIN_ROUTES } from '@client/admin/admin.routes';
import { useModal, uiVar, Button, Icon, loggerService, Text, useToast, useQueryLocalCommon } from '@client/common';
import { useMutationOrganisation } from '@client/organisation';
import React from 'react';
import { useHistory } from 'react-router-dom';

type Props = {
  orgId?: string;
};

export const AdminOrganisationDeleteModal = ({ orgId }: Props) => {
  const { closeModal } = useModal();
  const { deleteOrganisation } = useMutationOrganisation();
  const { addToast } = useToast();
  const { ui } = useQueryLocalCommon();
  const history = useHistory();

  const handleDeleteOrganisation = async () => {
    try {
      if (!orgId) {
        return;
      }
      uiVar('saving');
      await deleteOrganisation({ variables: { input: { orgId } } });
      uiVar('ready');
      closeModal();
      history.push(ADMIN_ROUTES.organisations);
      addToast('Organisation deleted.');
    } catch (error) {
      loggerService.error(error);
      addToast("Couldn't delete organisation.", 'danger');
      uiVar('ready');
    }
  };

  return (
    <div className="p-6">
      <div className="flex">
        <div className="mr-4">
          <Icon className="text-red-500" icon="error-circle-outlined" />
        </div>
        <div>
          <Text className="text-xl" isBlock>
            Delete Organisation
          </Text>
          <Text className="text-sm" variant="gray" isBlock>
            Are you sure you want to delete this organisation? This cannot be undone.
          </Text>
          <div className="flex justify-end mt-4">
            <Button className="mr-2" onClick={closeModal} variant="dark" state="outline" isDisabled={ui === 'saving'}>
              Cancel
            </Button>
            <Button onClick={handleDeleteOrganisation} variant="danger" isDisabled={ui === 'saving'}>
              Yes I&apos;m sure!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
