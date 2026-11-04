import { View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@tedoku/shared';
import { Text } from '@/components/Text';
import { TabBar } from '@/components/TabBar';
import { Button, Card, StateIcon, Title } from '@/components/ui';

/**
 * Care tab. The design leaves this tab without a screen yet ("#" link),
 * so this is a PLACEHOLDER until it is designed.
 */
export default function Care() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 16 }}>
        <StateIcon name="heart" bg={colors.primarySoft} color={colors.primary} />
        <Title style={{ textAlign: 'center' }}>Care</Title>
        <Card>
          <Text style={{ textAlign: 'center', color: colors.muted, lineHeight: 21 }}>
            Your referrals, care plans and follow-ups will live here. Coming soon.
          </Text>
        </Card>
        <Button label="Talk to a verified doctor" onPress={() => router.navigate('/doctors')} />
      </View>
      <TabBar active="Care" />
    </View>
  );
}
