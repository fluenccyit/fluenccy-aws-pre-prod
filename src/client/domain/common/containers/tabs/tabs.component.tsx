import React, { useState, useMemo, useCallback, useEffect, createContext, useContext, useRef } from 'react';
import cn from 'classnames';
import { every, find, map } from 'lodash';
import { TabModel, TabButton, TabsActiveIndicator } from '@client/common';

export type TabContextType<T> = {
  tabs: TabModel<T>[];
  activeTab: TabModel<T>;
  setTabs: (tabs: TabModel<T>[]) => void;
  setActiveTab: (tab: TabModel<T>) => void;
  setActiveTabById: (label: string) => void;
};

const TabsContext = createContext<TabContextType<any> | null>(null);

export type TabsVariant = 'pill' | 'ghost' | 'underline';

type Props<T> = {
  className?: string;
  onChange?: (activeTab: TabModel<T>) => void;
  initialTabId?: T | null;
  tabs: TabModel<T>[];
  variant?: TabsVariant;
  isDisabled?: boolean;
};

const BASE_CLASSES = ['relative', 'flex', 'items-center'];

export function Tabs<T>({ className, tabStyle = {}, variant = 'pill', initialTabId, tabs, onChange, isDisabled }: Props<T>) {
  const tabButtonRefs = useRef<HTMLButtonElement[]>([]);
  const initialTabById = initialTabId && find(tabs, ({ id }) => Boolean(id && id === initialTabId));
  const [tabsToManage, setTabs] = useState<TabModel<T>[]>(tabs);
  const [activeTab, setActiveTab] = useState<TabModel<T>>(initialTabById || tabs[0]);
  const classes = cn(className, BASE_CLASSES, {
    'bg-gray-200 rounded-full p-0.5': variant === 'pill',
  });

  useEffect(() => {
    setTabs(tabs);
    tabButtonRefs.current = [];
  }, [tabs]);

  useEffect(() => {
    handleSetActiveTab(activeTab);
  }, []);

  useEffect(() => {
    setActiveTab(initialTabById || tabs[0]);
  }, [initialTabById]);

  const handleSetActiveTab = useCallback(
    (activeTab: TabModel<T>) => {
      if (onChange) {
        const isChanged = onChange(activeTab);
        if (isChanged === false) return;
      }
      setActiveTab(activeTab);
    },
    [onChange]
  );

  const handleSetActiveTabById = useCallback(
    (idToActivate: T) => {
      const tabToActivate = find(tabs, ({ id }) => Boolean(id && id === idToActivate));

      if (tabToActivate) {
        handleSetActiveTab(tabToActivate);
      }
    },
    [tabs, handleSetActiveTab]
  );

  const memoizedContextValue = useMemo(
    () => ({
      activeTab,
      setActiveTab: handleSetActiveTab,
      setActiveTabById: handleSetActiveTabById,
      tabs: tabsToManage,
      setTabs,
    }),
    [activeTab, tabsToManage, handleSetActiveTab, handleSetActiveTabById]
  );

  if (!activeTab || !every(tabs, ({ id: idToCheck }) => find(tabsToManage, ({ id }) => id === idToCheck))) {
    return null;
  }

  return (
    <TabsContext.Provider value={memoizedContextValue as any}>
      <div className={classes}>
        {(variant === 'underline' || variant === 'pill') && (
          <TabsActiveIndicator tabButtonRefs={tabButtonRefs} variant={variant} tabStyle={tabStyle} />
        )}
        {map(tabs, (tab, index) => (
          <TabButton<T>
            key={index}
            variant={variant}
            isDisabled={isDisabled}
            ref={(ref) => ref && tabButtonRefs.current.push(ref)}
            {...tab}
            tabStyle={tabStyle}
          />
        ))}
      </div>
    </TabsContext.Provider>
  );
}

export const useTabs = () => {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('This component must be used within a <Tabs> component.');
  }

  return context;
};
