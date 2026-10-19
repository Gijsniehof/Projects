import { useState } from 'react';
import { StyleSheet, Text, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { colors, space } from '@/ui/theme';

import { BANDS, clampDial, pointToValue, valueToAngle } from './logic';

const BAND_COLORS: Record<number, string> = { 4: '#D1343A', 3: '#E8833A', 2: '#F2C14E' };
const PAD = 14;

interface DialProps {
  leftLabel: string;
  rightLabel: string;
  /** Needle position (0–100), or null to hide the needle. */
  value: number | null;
  /** Hidden target to draw (0–100), or null to keep it hidden. */
  target: number | null;
  /** When set, the dial can be dragged. */
  onChange?: (v: number) => void;
}

export function Dial({ leftLabel, rightLabel, value, target, onChange }: DialProps) {
  const [width, setWidth] = useState(0);
  const R = Math.max(0, width / 2 - PAD);
  const cx = width / 2;
  const cy = R + PAD;
  const height = R + PAD * 2;

  const track = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    onChange?.(pointToValue(locationX - cx, locationY - cy));
  };
  const touch = onChange
    ? {
        onStartShouldSetResponder: () => true,
        onMoveShouldSetResponder: () => true,
        onResponderTerminationRequest: () => false,
        onResponderGrant: track,
        onResponderMove: track,
      }
    : {};

  const pt = (v: number, r = R) => {
    const a = valueToAngle(v);
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
  };
  const wedge = (from: number, to: number) => {
    const a = pt(clampDial(from));
    const b = pt(clampDial(to));
    return `M ${cx} ${cy} L ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y} Z`;
  };

  // Five bands: 2 | 3 | 4 | 3 | 2
  const bands: { from: number; to: number; points: number }[] = [];
  if (target !== null) {
    const edges = [...BANDS].reverse(); // 12.5(2), 7.5(3), 2.5(4)
    for (let i = 0; i < edges.length; i++) {
      const outer = edges[i].halfWidth;
      const inner = i + 1 < edges.length ? edges[i + 1].halfWidth : 0;
      if (inner === 0) bands.push({ from: target - outer, to: target + outer, points: edges[i].points });
      else {
        bands.push({ from: target - outer, to: target - inner, points: edges[i].points });
        bands.push({ from: target + inner, to: target + outer, points: edges[i].points });
      }
    }
  }

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const needle = value !== null ? pt(value, R * 0.93) : null;

  return (
    <View style={{ gap: space.sm }}>
      <View onLayout={onLayout} style={{ height: height || 1 }} {...touch} accessibilityRole={onChange ? 'adjustable' : undefined} accessibilityLabel={`Wijzer tussen ${leftLabel} en ${rightLabel}`} accessibilityValue={value !== null ? { min: 0, max: 100, now: Math.round(value) } : undefined}>
        {width > 0 ? (
          <Svg width={width} height={height} pointerEvents="none">
            <Path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} Z`} fill={colors.soft} />
            <G>
              {bands.map((b, i) => (
                <Path key={i} d={wedge(b.from, b.to)} fill={BAND_COLORS[b.points]} />
              ))}
              {bands.map((b, i) => {
                const mid = (clampDial(b.from) + clampDial(b.to)) / 2;
                if (clampDial(b.to) - clampDial(b.from) < 3) return null;
                const p = pt(mid, R * 0.84);
                return (
                  <SvgText key={`t${i}`} x={p.x} y={p.y + 5} fontSize={14} fontWeight="700" fontFamily="sans-serif" fill="#FFFFFF" textAnchor="middle">
                    {b.points}
                  </SvgText>
                );
              })}
            </G>
            {needle ? (
              <G>
                <Line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke={colors.text} strokeWidth={5} strokeLinecap="round" />
                <Circle cx={cx} cy={cy} r={11} fill={colors.text} />
              </G>
            ) : (
              <Circle cx={cx} cy={cy} r={11} fill={colors.border} />
            )}
          </Svg>
        ) : null}
      </View>
      <View style={styles.labels}>
        <Text style={[styles.label, { textAlign: 'left' }]}>← {leftLabel}</Text>
        <Text style={[styles.label, { textAlign: 'right' }]}>{rightLabel} →</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: { flexDirection: 'row', justifyContent: 'space-between', gap: space.md },
  label: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.text },
});
