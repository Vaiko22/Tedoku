import { View } from 'react-native';
import { colors, type ChatMessage } from '@tedoku/shared';
import { Text } from './Text';

/** One chat bubble. `mine` is the sender shown on the right. */
export function Bubble({ m, mine }: { m: ChatMessage; mine: 'patient' | 'doctor' }) {
  const isMe = m.from === mine;
  const sys = m.from === 'system';
  return (
    <View style={{ flexDirection: 'row', justifyContent: sys ? 'center' : isMe ? 'flex-end' : 'flex-start' }}>
      <View style={{ maxWidth: '78%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, backgroundColor: isMe ? colors.primary : sys ? colors.primarySoft : '#fff' }}>
        <Text style={{ lineHeight: 20, color: isMe ? '#fff' : sys ? colors.primaryDeep : colors.ink, textAlign: sys ? 'center' : 'left' }}>{m.text}</Text>
      </View>
    </View>
  );
}
