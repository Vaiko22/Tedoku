import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const R = 40;
const C = 2 * Math.PI * R;

/** Circular progress ring used for the cycle and hydration cards on Home. */
export function Ring({ progress, color, track, children, size = 96 }: { progress: number; color: string; track: string; children: ReactNode; size?: number }) {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 96 96">
        <Circle cx={48} cy={48} r={R} fill="none" stroke={track} strokeWidth={10} />
        <Circle
          cx={48}
          cy={48}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${C}`}
          strokeDashoffset={C * (1 - p)}
          transform="rotate(-90 48 48)"
        />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}
