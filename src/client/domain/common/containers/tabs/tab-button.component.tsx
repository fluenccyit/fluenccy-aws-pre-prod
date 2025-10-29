import React, { ForwardedRef, forwardRef, ReactNode } from 'react';
import cn from 'classnames';
import { find, indexOf, map } from 'lodash';
import { useTabs } from '@client/common';

type Props<T> = {
  className?: string;
  id: T;
  label: ReactNode;
  variant?: 'pill' | 'ghost' | 'underline';
  isDisabled?: boolean;
};

const BASE_CLASSES = ['flex', 'items-center', 'hover:text-gray-900', 'focus:outline-none', 'justify-center'];
const BASE_PILL_CLASSES = ['text-sm', 'rounded-full', 'h-7', 'text-gray-500', 'px-3', 'z-1'];
const BASE_UNDERLINE_CLASSES = ['text-md', 'py-5', 'text-gray-600', 'border-b-4', 'border-transparent', 'mr-14', 'last:mr-0'];

function TabButtonInner<T>({ className, id, label, variant, isDisabled, tabStyle }: Props<T>, ref: ForwardedRef<HTMLButtonElement>) {
  const { activeTab, setActiveTab, tabs } = useTabs();
  const tab = find(tabs, ({ id: idToCheck }) => idToCheck === id);

  if (!tab) {
    throw new Error(`The '${id}' tab does not exist in the tabs [${map(tabs, 'id').join(', ')}].`);
  }

  let classes = cn(className, BASE_CLASSES, {
    'mr-2': indexOf(tabs, tab) !== tabs.length - 1,
    'is-active': activeTab.id === id,
    'opacity-50 pointer-events-none': isDisabled,
  });

  if (variant === 'pill') {
    classes = cn(classes, BASE_PILL_CLASSES, {
      'text-gray-900': activeTab.id === id,
    });
  }

  if (variant === 'ghost') {
    classes = cn(classes, {
      'text-gray-900': activeTab.id === id,
    });
  }

  if (variant === 'underline') {
    classes = cn(classes, BASE_UNDERLINE_CLASSES);
  }

  return (
    <button className={classes} onClick={() => setActiveTab(tab)} type="button" data-testid={`flnc-tab-${id}`} disabled={isDisabled} ref={ref} style={tabStyle}>
      {/* Wrapping the content in a div, so we can get the exact width of the content without having to hard code the padding offset. */}
      <div>{label}</div>
    </button>
  );
}

export const TabButton = forwardRef(TabButtonInner) as <T>(
  props: Props<T> & { ref?: React.ForwardedRef<HTMLButtonElement> }
) => ReturnType<typeof TabButtonInner>;
