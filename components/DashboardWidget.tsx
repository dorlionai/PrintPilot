import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  onPress?: () => void;
}

export function DashboardWidget({ title, value, subtitle, icon, color = COLORS.primary, onPress }: Props) {
  // Tarih karşılaştırması kasıtlı olarak 'tr-TR' formatında sabit bırakıldı
  // AsyncStorage'daki mevcut kullanıcı verilerini korumak için değiştirilmemeli
  const today = new Date().toLocaleDateString('tr-TR');

  return (
    <TouchableOpacity style={[styles.container, { borderLeftColor: color }]} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    gap: 14,
  },
  iconWrap: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  title: { color: COLORS.textSecondary, fontSize: SIZES.sm, marginBottom: 4 },
  value: { fontSize: SIZES.xxl, fontWeight: 'bold' },
  subtitle: { color: COLORS.textSecondary, fontSize: SIZES.xs, marginTop: 2 },
});