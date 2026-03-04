import 'intl-pluralrules';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigations/AppNavigator';
import i18n from './src/config/i18n';

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </I18nextProvider>
  );
}


