import React, { useState } from 'react';
import { AdminOrganisationDeleteModal } from '@client/admin';
import { useQueryLocalOrganisation, useMutationOrganisation, LocalAdminOrganisationType } from '@client/organisation';
import { loggerService, Text, useQueryLocalCommon, useToast, uiVar, Button, Dropdown, DropdownContent, Icon, useModal } from '@client/common';

export const AdminOrganisationActionsDropdown = () => {
  const { organisation: localOrganisation } = useQueryLocalOrganisation();
  const { refreshOrganisationToken, recalculateOrganisationCurrencyScores, resyncOrganisation } = useMutationOrganisation();
  const { ui } = useQueryLocalCommon();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { addToast } = useToast();
  const { openModal } = useModal();

  const handleRefreshToken = async () => {
    try {
      setIsDropdownOpen(false);
      uiVar('loading');
      await refreshOrganisationToken({ variables: { input: { orgId } } });
      uiVar('ready');
      addToast('Token refreshed.');
    } catch (error) {
      loggerService.error(error);
      addToast("Couldn't refresh token.", 'danger');
    }
  };

  const handleResync = async () => {
    try {
      setIsDropdownOpen(false);
      uiVar('loading');
      await resyncOrganisation({ variables: { input: { orgId } } });
      uiVar('ready');
      addToast('Invoice and payment resync job started.');
    } catch (error) {
      loggerService.error(error);
      addToast("Couldn't resync invoices and payments.", 'danger');
    }
  };

  const handleRecalculateCurrencyScores = async () => {
    try {
      setIsDropdownOpen(false);
      uiVar('loading');
      await recalculateOrganisationCurrencyScores({ variables: { input: { orgId } } });
      uiVar('ready');
      addToast('Currency score recalculation job started.');
    } catch (error) {
      loggerService.error(error);
      addToast("Couldn't recalculate currency scores.", 'danger');
    }
  };

  const handleClickDelete = () => {
    setIsDropdownOpen(false);
    openModal(<AdminOrganisationDeleteModal orgId={localOrganisation?.id} />);
  };

  if (!localOrganisation) {
    return null;
  }

  const { tokenStatus, id: orgId } = localOrganisation as LocalAdminOrganisationType;

  return (
    <>
      <Button className="px-0" onClick={() => setIsDropdownOpen(true)} variant="dark" state="outline" isDisabled={ui === 'loading'} isRounded>
        <Text>Actions</Text>
        <Icon className="text-gray-900" icon="carat-down" />
      </Button>
      <Dropdown className="top-14 right-5" onClickOutside={() => setIsDropdownOpen(false)} isOpen={isDropdownOpen}>
        {tokenStatus !== 'disconnected' && (
          <>
            <DropdownContent onClick={handleRefreshToken} isDisabled={ui === 'loading'}>
              <div className="flex justify-start items-center">
                <Icon className="mr-2" icon="refresh-token" />
                <Text>Refresh Token</Text>
              </div>
            </DropdownContent>
            <DropdownContent onClick={handleResync} isDisabled={ui === 'loading'}>
              <div className="flex justify-start items-center">
                <Icon className="mr-2" icon="resync-invoices" />
                <Text>{`${'Resync Invoices & payments'}`}</Text>
              </div>
            </DropdownContent>
          </>
        )}
        <DropdownContent onClick={handleRecalculateCurrencyScores} isDisabled={ui === 'loading'}>
          <div className="flex justify-start items-center">
            <Icon className="mr-2" icon="recalculate-scores" />
            <Text>Recalculate Currency Scores</Text>
          </div>
        </DropdownContent>
        <DropdownContent onClick={handleClickDelete} isDisabled={ui === 'loading'}>
          <div className="flex justify-start items-center ">
            <Icon className="mr-2 text-red-500" icon="rubbish-bin" />
            <Text variant="danger">Delete</Text>
          </div>
        </DropdownContent>
      </Dropdown>
    </>
  );
};
