import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../constants/theme';
import { getSubscriptionStatus } from '../services/subscriptionService';

const PLANS = [
  {
    id: 'free',
    name: 'Ücretsiz',
    price: '₺0',
    period: '',
    color: COLORS.textSecondary,
    features: ['Günlük 5 hesaplama', 'Temel sipariş takibi', 'Reklamlı'],
    missing: ['Sınırsız hesaplama', 'PDF teklif', 'Gelişmiş istatistik', 'Reklamsız'],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '₺99',
    period: '/ay',
    color: COLORS.primary,
    features: ['Sınırsız hesaplama', 'PDF teklif oluşturma', 'Tüm istatistikler', 'Müşteri & yazıcı takibi', 'Reklamsız'],
    missing: ['Dealer özellikleri'],
  },
  {
    id: 'dealer',
    name: 'Dealer',
    price: '₺199',
    period: '/ay',
    color: COLORS.gold,
    features: ['Standard'ın her şeyi', 'Çoklu işletme desteği', 'Öncelikli destek', 'Erken erişim', 'Gelişmiş raporlama'],
    missing: [],
  },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscriptionStatus().then(s => { setCurrent(s); setLoading(false); });
  }, []);

  const handlePurchase = (planId: string) => {
    if (planId === current) return;
    Alert.alert('Yakında', 'RevenueCat entegrasyonu tamamlandığında satın alma aktif olacak.');
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.primary} size="large" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SIZES.padding }}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </TouchableOpacity>
      <Text style={styles.title}>PrintPilot Premium</Text>
      <Text style={styles.subtitle}>3D baskı işletmenizi büyütün</Text>
      {PLANS.map(plan => (
        <View key={plan.id} style={[styles.planCard, { borderColor: current === plan.id ? plan.color : COLORS.border }, current === plan.id && { borderWidth: 2 }]}>
          {current === plan.id && (
            <View style={[styles.activeBadge, { backgroundColor: plan.color }]}>
              <Text style={styles.activeBadgeText}>Mevcut Plan</Text>
            </View>
          )}
          <View style={styles.planHeader}>
            <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
              <Text style={styles.planPeriod}>{plan.period}</Text>
            </View>
          </View>
          {plan.features.map(f => (
            <View key={f} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
          {plan.missing.map(f => (
            <View key={f} style={styles.featureRow}>
              <Ionicons name="close-circle" size={16} color={COLORS.border} />
              <Text style={[styles.featureText, { color: COLORS.textSecondary }]}>{f}</Text>
            </View>
          ))}
          {plan.id !== 'free' && plan.id !== current && (
            <TouchableOpacity style={[styles.buyBtn, { backgroundColor: plan.color }]} onPress={() => handlePurchase(plan.id)}>
              <Text style={styles.buyBtnText}>{plan.name}'a Geç</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <Text style={styles.footer}>Abonelikler otomatik yenilenir. İstediğiniz zaman iptal edebilirsiniz.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  back: { marginBottom: 16 },
  title: { fontSize: SIZES.xxxl, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  subtitle: { color: COLORS.textSecondary, fontSize: SIZES.md, marginBottom: 24 },
  planCard: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusLg, padding: 20, marginBottom: 16, borderWidth: 1, overflow: 'hidden' },
  activeBadge: { position: 'absolute', top: 0, right: 0, paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: SIZES.radius },
  activeBadgeText: { color: '#fff', fontSize: SIZES.xs, fontWeight: 'bold' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  planName: { fontSize: SIZES.xl, fontWeight: 'bold' },
  planPrice: { fontSize: SIZES.xxl, fontWeight: 'bold' },
  planPeriod: { color: COLORS.textSecondary, fontSize: SIZES.sm, marginLeft: 2 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  featureText: { color: COLORS.text, fontSize: SIZES.sm },
  buyBtn: { borderRadius: SIZES.radius, padding: 14, alignItems: 'center', marginTop: 16 },
  buyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: SIZES.md },
  footer: { color: COLORS.textSecondary, fontSize: SIZES.xs, textAlign: 'center', marginTop: 8, marginBottom: 40 },
});