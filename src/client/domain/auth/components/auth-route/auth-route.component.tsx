import React, { createElement, ComponentType, memo, useEffect } from 'react';
import { Route, RouteProps } from 'react-router-dom';
import { useAnalytics } from '@client/common';

type Props = RouteProps & {
  component: ComponentType<any>;
};

export const AuthRoute = memo((props: Props) => {
  const { component, ...rest } = props;
  const { identify, page } = useAnalytics();

  useEffect(() => {
    (async () => {
      await identify();
      await page();
    })();
  }, []);

  return <Route {...rest} render={(props) => createElement(component, props)} />;
});
