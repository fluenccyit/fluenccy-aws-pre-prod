import React, { memo, useState } from 'react';
import cn from 'classnames';
import { Tabs } from '@client/common';
import { LocalOrganisationType, organisationVar, useMutationOrganisation, useQueryLocalOrganisation } from '@client/organisation';
import { getVariableProbability } from '@client/utils/helper';

const BASE_CLASSES = ['flex', 'items-center', 'border-r', 'border-gray-200', 'h-full', 'px-6'];

type Props = {
  onChange: Function;
  month: string;
  orderProbability: number;
  minimumProbability: number;
  maximumProbability: number;
  isSetOptimised: boolean;
};
export const PayableProbability = memo(({ orderProbability, minimumProbability, maximumProbability, isSetOptimised }: Props) => {
  const { organisation } = useQueryLocalOrganisation();
  const { updateOrganisation } = useMutationOrganisation();
  const [oldSelectedTab, setOldSelectedTab] = useState(getVariableProbability(organisation));
  const TABS = [
    {
      id: 'minimumProbability',
      label: `Min Probability`,
    },
    {
      id: 'orderProbability',
      label: `Optimised Probability`,
    },
    {
      id: 'maximumProbability',
      label: `Max Probability`,
    },
  ];

  const updateOrgVirtually = (variableProbability) => {
    organisationVar({ ...organisation, variableProbability } as LocalOrganisationType);
  };

  const onChange = async (tab) => {
    try {
      updateOrgVirtually(tab.id);
      await updateOrganisation({
        variables: { input: { orgId: organisation.id, variableProbability: tab.id } },
      });
      // setOldSelectedTab(tab.id);
    } catch (error) {
      console.log(error);
      // updateOrgVirtually(oldSelectedTab);
    }
  };

  const selectedTab = getVariableProbability(organisation);

  return (
    <div className={cn(BASE_CLASSES)}>
      <Tabs tabs={TABS} initialTabId={selectedTab || TABS[TABS.length - 1].id} onChange={onChange} variant="pill" />
    </div>
  );
});
