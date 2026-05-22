import {Stack} from 'expo-router';
import React from 'react';

import {IntlProviderShell} from '@/i18n/intl-provider-shell';
import {LocaleProvider} from '@/i18n/locale-context';

export default function RootLayout() {
  return (
    <LocaleProvider>
      <IntlProviderShell>
        <Stack screenOptions={{headerShown: false}} />
      </IntlProviderShell>
    </LocaleProvider>
  );
}
