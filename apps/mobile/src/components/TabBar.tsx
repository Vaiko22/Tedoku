import { Pressable, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@tedoku/shared';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';

type Tab = { label: string; href: Href; icon: IconName };

export const PATIENT_TABS: Tab[] = [
  { label: 'Home', href: '/home', icon: 'home' },
  { label: 'Learn', href: '/learn', icon: 'book' },
  { label: 'Doctors', href: '/doctors', icon: 'chat' },
  { label: 'Care', href: '/care', icon: 'heart' },
  { label: 'Me', href: '/me', icon: 'me' },
];

export const PROVIDER_TABS: Tab[] = [
  { label: 'Home', href: '/provider', icon: 'home' },
  { label: 'Chats', href: '/provider/chats', icon: 'chat' },
  { label: 'Earnings', href: '/provider/earnings', icon: 'earnings' },
  { label: 'Profile', href: '/provider/profile', icon: 'me' },
];

/**
 * The bottom tab bar from the design. Screens render it themselves (like the
 * design boards do), so detail screens such as Cycle or a chat keep it too.
 */
export function TabBar({ active, tabs = PATIENT_TABS }: { active: string; tabs?: Tab[] }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={{ flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.tabBorder, paddingTop: 8, paddingHorizontal: 8, paddingBottom: Math.max(insets.bottom, 12), minHeight: 84 }}
    >
      {tabs.map((t) => {
        const on = t.label === active;
        const c = on ? colors.primary : colors.muted;
        return (
          <Pressable
            key={t.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t.label}
            onPress={() => !on && router.navigate(t.href)}
            style={{ flex: 1, alignItems: 'center', gap: 4 }}
          >
            <Icon name={t.icon} size={24} color={c} strokeWidth={1.9} />
            <Text style={{ fontSize: 11, fontWeight: on ? '700' : '600', color: c }}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
