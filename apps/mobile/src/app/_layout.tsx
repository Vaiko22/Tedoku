import '@/lib/api';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { colors } from '@tedoku/shared';
import { SessionProvider } from '@/lib/session';
import { Loading } from '@/components/ui';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar style="dark" />
        {fontsLoaded ? (
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
            {/* Tab destinations swap in place, like the design's bottom bar. */}
            {['home', 'learn', 'doctors', 'care', 'me', 'provider/index', 'provider/chats', 'provider/earnings', 'provider/profile'].map((name) => (
              <Stack.Screen key={name} name={name} options={{ animation: 'none' }} />
            ))}
            <Stack.Screen name="index" options={{ animation: 'fade' }} />
          </Stack>
        ) : (
          <Loading />
        )}
      </SessionProvider>
    </SafeAreaProvider>
  );
}
