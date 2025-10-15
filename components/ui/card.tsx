import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export function Card({ style, children, ...props }: ViewProps) {
  const backgroundColor = useThemeColor({}, 'cardBackground');
  return (
    <View style={[styles.card, { backgroundColor }, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)'
  }
});

export default Card;
