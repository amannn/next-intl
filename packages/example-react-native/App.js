import {StatusBar} from 'expo-status-bar';
import {StyleSheet, Text, View} from 'react-native';
import {IntlProvider, useTranslations} from 'use-intl';

// You can get the messages from anywhere you like. You can also
// fetch them from within a component and then render the provider
// along with your app once you have the messages.
const messages = {
  App: {
    hello: 'Hello {username}!'
  }
};

export default function Root() {
  return (
    <IntlProvider messages={messages} locale="en">
      <App user={{name: 'Jane'}} />
    </IntlProvider>
  );
}

function App({user}) {
  const t = useTranslations('App');
  return (
    <View style={styles.container}>
      <Text>{t('hello', {username: user.name})}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
