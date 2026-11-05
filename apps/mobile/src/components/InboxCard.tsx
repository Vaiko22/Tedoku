import { View } from 'react-native';
import { colors, type ProviderInboxItem } from '@tedoku/shared';
import { Text } from './Text';
import { Avatar, Card, Tag } from './ui';

/** A patient request / chat card in the doctor's inbox. */
export function InboxCard({ x, children }: { x: ProviderInboxItem; children?: React.ReactNode }) {
  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar initials={x.initials} tint={x.tint} size={44} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 15, fontWeight: '800' }}>
            {x.alias} <Text style={{ fontSize: 12, fontWeight: '600', color: colors.muted }}>· {x.ageRange}</Text>
          </Text>
          <Text style={{ fontSize: 12, fontWeight: '500', color: colors.muted, lineHeight: 16 }}>{x.topic}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <Tag label={x.paidLabel} />
        {x.status === 'request' && x.replyWithin && <Tag label={x.replyWithin} bg={colors.warningSoft} fg={colors.warningInk} />}
      </View>
      {children}
    </Card>
  );
}
