import React, { useState, useEffect, MutableRefObject } from 'react';
import cn from 'classnames';
import { findIndex } from 'lodash';
import { motion } from 'framer-motion';
import { TabsVariant, useTabs } from '@client/common';

type Props = {
  tabButtonRefs: MutableRefObject<HTMLButtonElement[]>;
  variant: TabsVariant;
};

const BASE_CLASSES = ['absolute', 'w-full'];
const BASE_CONTENT_CLASSES = ['absolute', 'h-full'];

export function TabsActiveIndicator({ tabStyle = {}, tabButtonRefs, variant }: Props) {
  const { activeTab, tabs } = useTabs();
  const [style, setStyle] = useState<{ left: string; width: string }>();
  const classes = cn(BASE_CLASSES, {
    'bottom-0 h-1': variant === 'underline',
    'top-0.5 bottom-0.5': variant === 'pill',
  });
  const contentClasses = cn(BASE_CONTENT_CLASSES, {
    'bg-green-500': variant === 'underline',
    'bg-white shadow rounded-full': variant === 'pill',
  });

  useEffect(() => {
    const activeIndex = findIndex(tabs, ({ id }) => id === activeTab.id);
    const activeTabButtonRef = tabButtonRefs.current[activeIndex];

    if (!activeTabButtonRef) {
      return;
    }

    let left = 0;

    for (let i = 0; i < activeIndex; i += 1) {
      const tabButtonWidth = tabButtonRefs.current[i]?.getBoundingClientRect().width || 0;

      left += tabButtonWidth;

      if (variant === 'underline') {
        // If this is the underline variant, adding 56px to left to account for the margin left on the tab buttons.
        left += 56;
      } else if (variant === 'pill') {
        // Adding 8px to account for the margin right on the tab buttons,
        left += 8;
      }
    }

    let width = 0;
    if (variant === 'underline') {
      // With the underline variant, we want the width of the border bottom to be the same as the text. So we use the bounding client rectangle of the
      // first child.
      width = activeTabButtonRef.children[0].getBoundingClientRect().width || 0;
    } else if (variant === 'pill') {
      width = activeTabButtonRef.getBoundingClientRect().width || 0;
    }

    setStyle({ left: `${left}px`, width: `${width}px` });
  }, [tabButtonRefs, activeTab, tabs]);

  if (!style) {
    return null;
  }

  return (
    <div className={classes}>
      <motion.div className={contentClasses} style={{...style, ...tabStyle}} layout />
    </div>
  );
}
