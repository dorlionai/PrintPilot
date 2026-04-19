import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { getOrders } from '../../services/database';
import { t } from '../../constants/i18n';

export default function StatsScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [period, setPeriod] = useState<'daily' | 'monthly'>('monthly');

  useEffect(() => { setOrders(getOrders() as any[]); }, []);

  const now = new Date();
  const filtered = orders.filter(o => {
    const d = new Date(o.created_at);
    if (period === 'daily') return d.toDateString() === now.toDateString();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalRevenue = filtered.reduce((s, o) => s + (o.sale_price || 0), 0);
  const totalCost = filtered.reduce((s, o) => s + (o.cost_price || 0), 0);
  const totalProfit = totalRevenue - totalCost;
  const avgPrice = filtered.length ? totalRevenue / filtered.length : 0;

  const Stat = ({ label, value, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SIZES.padding }}>
      <Text style={styles.title}>{t('stats.title')}</Text>
      <View style={styles.toggle}>
        {(['monthly', 'daily'] as const).map(p => (
          <TouchableOpacity key={p} style={[styles.toggleBtn, period === p && styles.toggleActive]} onPress={() => setPeriod(p)}>
            <Text style={{ color: period === p ? '#fff' : COLORS.textSecondary, fontWeight: 'bold' }}>
              {p === 'monthly' ? t('stats.monthly') : t('stats.daily')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Stat label={t('stats.total_revenue')} value={'₺' + totalRevenue.toFixed(2)} color={COLORS.success} />
      <Stat label="Toplam Maliyet" value={'₺' + totalCost.toFixed(2)} color={COLORS.error} />
      <Stat label="Toplam Kar" value={'₺' + totalProfit.toFixed(2)} color={COLORS.gold} />
      <Stat label={t('stats.total_orders')} value={String(filtered.length)} color={COLORS.primary} />
      <Stat label="Ortalama Sipariş" value={'₺' + avgPrice.toFixed(2)} color={COLORS.secondary} />
      {filtered.length === 0 && (
        <Text style={styles.empty}>Bu dönem için sipariş bulunamadı.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: SIZES.xxl, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
  toggle: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: 4, marginBottom: 20 },
  toggleBtn: { flex: 1, padding: 10, borderRadius: SIZES.radius - 2, alignItems: 'center' },
  toggleActive: { backgroundColor: COLORS.primary },
  statCard: { backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderWidth: 1, borderColor: COLORS.border },
  statLabel: { color: COLORS.textSecondary, fontSize: SIZES.sm, marginBottom: 6 },
  statValue: { fontSize: SIZES.xxl, fontWeight: 'bold' },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 },
});