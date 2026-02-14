import { LinearGradient } from 'expo-linear-gradient';
import type { ColorValue } from 'react-native';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { gradients, radius, typography } from '../theme';

interface GradientButtonProps {
  onPress: () => void;
  label: string;
  colors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
}

export function GradientButton({
  onPress,
  label,
  colors = gradients.primary,
}: GradientButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.wrapper}>
      <LinearGradient
        colors={[...colors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.text}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: radius.xl,
  },
  text: {
    color: '#fff',
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
  },
});
