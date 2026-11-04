import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '@tedoku/shared';

type Shape = { d?: string[]; circles?: [number, number, number][]; rects?: [number, number, number, number, number][] };

/** Stroke icons used across the design (24×24 grid). */
const ICONS = {
  drop: { d: ['M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z'] },
  lock: { rects: [[5, 11, 14, 9, 2]], d: ['M8 11V8a4 4 0 018 0v3'] },
  shield: { d: ['M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z', 'M9 12l2 2 4-4'] },
  heart: { d: ['M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z'] },
  back: { d: ['M15 5l-7 7 7 7'] },
  chevron: { d: ['M9 6l6 6-6 6'] },
  user: { circles: [[12, 8, 4]], d: ['M4 21c0-4 4-6 8-6s8 2 8 6'] },
  phone: { rects: [[7, 2, 10, 20, 2]], d: ['M11 18h2'] },
  mail: { rects: [[3, 5, 18, 14, 2]], d: ['M3 7l9 6 9-6'] },
  info: { circles: [[12, 12, 9]], d: ['M12 7v6M12 16.5h.01'] },
  search: { circles: [[11, 11, 7]], d: ['M20 20l-4-4'] },
  moon: { d: ['M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z'] },
  home: { d: ['M3 11l9-8 9 8M5 10v10h14V10'] },
  book: { d: ['M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19V5'] },
  chat: { d: ['M4 5h16v11H9l-5 4z'] },
  me: { d: ['M12 4a4 4 0 100 8 4 4 0 000-8zM4 21c0-4 4-6 8-6s8 2 8 6'] },
  earnings: { d: ['M12 3v18M16 7H9.5a2.5 2.5 0 000 5h5a2.5 2.5 0 010 5H8'] },
  send: { d: ['M4 12l16-8-6 16-2.5-6.5z', 'M11.5 13.5L20 4'] },
  check: { d: ['M5 12.5l4.5 4.5L19 7.5'] },
  close: { d: ['M6 6l12 12M18 6L6 18'] },
  idCard: { d: ['M4 6h16v12H4zM8 11h4M8 14h8'] },
  selfie: { d: ['M12 4a4 4 0 100 8 4 4 0 000-8zM4 21c0-4 4-6 8-6s8 2 8 6'] },
  document: { d: ['M6 3h9l4 4v14H6zM9 12h7M9 16h7'] },
  wallet: { rects: [[3, 6, 18, 13, 3]], d: ['M3 10h18', 'M16.5 14.5h.01'] },
  receive: { d: ['M12 4v11M7 10l5 5 5-5M5 20h14'] },
  clock: { circles: [[12, 12, 9]], d: ['M12 7v5l3 2'] },
  alert: { d: ['M12 4l9 16H3z', 'M12 10v4M12 17h.01'] },
} satisfies Record<string, Shape>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, color = colors.ink, strokeWidth = 1.8 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const s: Shape = ICONS[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {s.rects?.map(([x, y, w, h, r], i) => <Rect key={'r' + i} x={x} y={y} width={w} height={h} rx={r} />)}
      {s.circles?.map(([cx, cy, r], i) => <Circle key={'c' + i} cx={cx} cy={cy} r={r} />)}
      {s.d?.map((d, i) => <Path key={'p' + i} d={d} />)}
    </Svg>
  );
}
