import {useExtracted} from 'expo-intl';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Greeting, LocaleSwitcher} from '@example-monorepo/ui';

import {useAppLocale} from '@/i18n/locale-context';

export default function HomeScreen() {
  const t = useExtracted('home');
  const {locale, setLocale} = useAppLocale();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('Mobile app — shared UI demo')}</Text>

        <View style={styles.card}>
          <Greeting
            name="Hugo"
            unreadCount={3}
            Text={({children}) => <Text style={styles.body}>{children}</Text>}
            Strong={({children}) => <Text style={styles.strong}>{children}</Text>}
          />
        </View>

        <View style={styles.switcher}>
          <LocaleSwitcher
            locale={locale}
            setLocale={setLocale}
            Label={({children}) => <Text style={styles.label}>{children}</Text>}
            Button={({isActive, onPress, children}) => (
              <Pressable
                onPress={onPress}
                style={[styles.chip, isActive && styles.chipActive]}>
                <Text style={isActive ? styles.chipTextActive : styles.chipText}>
                  {children}
                </Text>
              </Pressable>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#0b1020'},
  container: {flex: 1, padding: 24, gap: 20},
  title: {color: '#fff', fontSize: 24, fontWeight: '600'},
  card: {backgroundColor: '#1c2440', padding: 20, borderRadius: 12},
  body: {color: '#dbe2ff', fontSize: 16, lineHeight: 24},
  strong: {color: '#fff', fontWeight: '700'},
  switcher: {flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap'},
  label: {color: '#aab4d4', fontSize: 14, marginRight: 4},
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3a4673'
  },
  chipActive: {backgroundColor: '#3c87f7', borderColor: '#3c87f7'},
  chipText: {color: '#dbe2ff', fontSize: 14},
  chipTextActive: {color: '#fff', fontSize: 14, fontWeight: '600'}
});
