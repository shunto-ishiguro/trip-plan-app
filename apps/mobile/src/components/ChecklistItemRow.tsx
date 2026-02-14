import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import type { ChecklistItem } from '../types';

interface ChecklistItemRowProps {
  item: ChecklistItem;
  onToggle: () => void;
  onPress: () => void;
}

export function ChecklistItemRow({ item, onToggle, onPress }: ChecklistItemRowProps) {
  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <TouchableOpacity
        style={[styles.checkbox, item.checked && styles.checkboxChecked]}
        onPress={handleToggle}
      >
        {item.checked && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <Text style={[styles.text, item.checked && styles.textChecked]} numberOfLines={2}>
        {item.text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.secondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border.primary,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: '#fff',
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
  },
  text: {
    flex: 1,
    fontSize: typography.fontSizes.lg,
    color: colors.text.primary,
  },
  textChecked: {
    color: colors.text.quaternary,
    textDecorationLine: 'line-through',
  },
});
