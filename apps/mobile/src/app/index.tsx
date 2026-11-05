import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@tedoku/shared';
import { Text } from '@/components/Text';
import { Icon } from '@/components/Icon';

/** 1. Splash */
export default function Splash() {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Continue to Tedoku" onPress={() => router.replace('/welcome')} style={{ flex: 1 }}>
      <LinearGradient colors={[colors.primary, colors.primaryDarker]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <View
          style={{ width: 92, height: 92, borderRadius: 30, backgroundColor: 'rgba(255,255,255,.14)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,.28)', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="drop" size={46} color="#fff" strokeWidth={1.7} />
        </View>
        <Text style={{ fontSize: 38, fontWeight: '800', letterSpacing: 8, color: '#fff', paddingLeft: 8 }}>TEDOKU</Text>
        <Text style={{ fontSize: 16, color: colors.splashMuted, fontWeight: '500' }}>Care within reach</Text>
        <Text style={{ position: 'absolute', bottom: 56, fontSize: 13, color: colors.splashMuted, fontWeight: '600' }}>Tap to continue</Text>
      </LinearGradient>
    </Pressable>
  );
}
