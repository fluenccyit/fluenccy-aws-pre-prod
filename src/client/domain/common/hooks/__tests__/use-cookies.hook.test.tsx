import React, { useEffect } from 'react';
import { testService } from '@test/client';
import { CookiesProvider } from 'react-cookie';
import { useCookies } from '@client/common';

const MockComponent = ({ cookie = '' }: { cookie?: string }) => {
  const { getCookie, setCookie, removeCookie } = useCookies();

  useEffect(() => {
    setCookie('firebase-token', cookie);
  }, []);

  return (
    <>
      <button onClick={() => removeCookie('firebase-token')}>Remove cookie</button>
      <div>{getCookie('firebase-token')}</div>
    </>
  );
};

describe('Common | Hooks | useCookies', () => {
  it('should set cookies to the passed value', () => {
    const { getByText } = testService.render(
      <CookiesProvider>
        <MockComponent cookie="Render me" />
      </CookiesProvider>
    );

    expect(getByText('Render me')).toBeTruthy();
  });

  it('should remove cookies when remove cookie called', () => {
    const { getByText, queryByText } = testService.render(
      <CookiesProvider>
        <MockComponent cookie="Render me" />
      </CookiesProvider>
    );

    expect(getByText('Render me')).toBeTruthy();
    getByText('Remove cookie').click();
    expect(queryByText('Render me')).toBeFalsy();
  });
});
