import React, { memo } from 'react';
import { Button, ErrorPanel, Text } from '@client/common';
import xeroNoDataImage from '@assets/images/xero-no-data.png';
import { useQueryLocalOrganisation } from '@client/organisation';

type Props = {
  state?: 'error' | 'no-data';
  onClickImport?: Function;
};

export const ChartErrorPanel = memo(({ state = 'error', onClickImport }: Props) => {
  const { organisation } = useQueryLocalOrganisation();
  const renderContent = () => {
    if (state === 'error') {
      return <ErrorPanel />;
    }

    if (state === 'no-data') {
      return (
        <div className="h-full flex flex-col items-center justify-center">
          <div className="w-24 h-36 mb-3.5">
            <img className="w-24 h-36" src={xeroNoDataImage} alt="Hand holding single bar from graph" />
          </div>
          <Text className="text-xl font-bold mb-3.5">No Data</Text>
          <Text className="text-xl max-w-md text-center">
            Oh no, your {organisation?.tenant.id.includes('tenant_') ? '' : 'Xero'} account is empty, upload an invoice and resync your account to see
            your currency position
          </Text>
          {onClickImport && (
            <div className="pt-1 w-full flex justify-center top-0 pb-4 z-50">
              <Button variant="success" isRounded onClick={onClickImport}>
                Import
              </Button>
            </div>
          )}
        </div>
      );
    }
  };

  return <div className="w-full h-chart">{renderContent()}</div>;
});
