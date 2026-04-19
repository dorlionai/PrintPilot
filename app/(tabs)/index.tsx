import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { COLORS, SIZES } from '../../constants/theme';
import { calculate, CalcInput } from '../../services/calculator';
import { t } from '../../constants/i18n';
import { addOrder, getOrders, getCustomers, getStock } from '../../services/database';

// Dashboard widget bileşeni — GPT-4o önerisi
function QuickStatCard({ icon, label, value, color }: any) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function CalculatorScreen() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calc'>('dashboard');
  const [stats, setStats] = useState({ orders: 0, customers: 0, revenue: 0, stock: 0 });
  const [form, setForm] = useState({
    filamentWeight: '50', filamentCostPerKg: '500', printTimeHours: '3',
    electricityKwh: '2.5', printerWatts: '200', failureRate: '10',
    laborHourly: '50', profitMargin: '30', commission: '0',
    vatRate: '20', includeVat: false, extraCosts: '0',
  });
  const [result, setResult] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useFocusEffect(useCallback(() => {
    try {
      const orders = getOrders() as any[];
      const customers = getCustomers() as any[];
      const stock = getStock() as any[];
      const revenue = orders.reduce((s: number, o: any) => s + (o.sale_price || 0), 0);
      setStats({ orders: orders.length, customers: customers.length, revenue, stock: stock.length });
    } catch(e) {}
  }, []));

  const handleCalc = () => {
    const input: CalcInput = {
      filamentWeight: parseFloat(form.filamentWeight) || 0,
      filamentCostPerKg: parseFloat(form.filamentCostPerKg) || 0,
      printTimeHours: parseFloat(form.printTimeHours) || 0,
      electricityKwh: parseFloat(form.electricityKwh) || 0,
      printerWatts: parseFloat(form.printerWatts) || 0,
      failureRate: parseFloat(form.failureRate) || 0,
      laborHourly: parseFloat(form.laborHourly) || 0,
      profitMargin: parseFloat(form.profitMargin) || 0,
      commission: parseFloat(form.commission) || 0,
      vatRate: parseFloat(form.vatRate) || 0,
      includeVat: form.includeVat,
      extraCosts: parseFloat(form.extraCosts) || 0,
    };
    setSaved(false);
    setResult(calculate(input));
  };

  const handleSave = () => {
    if (!result) return;
    addOrder({ customer_name: 'Genel', customer_id: null, printer_id: null,
      filament_weight: parseFloat(form.filamentWeight), print_time: parseFloat(form.printTimeHours),
      cost_price: result.totalCost, sale_price: result.finalPrice, notes: '' });
    setSaved(true);
    Alert.alert(t('common.success'), 'Sipariş kaydedildi!');
  };

  const Field = ({ label, fkey, decimal = true }: { label: string; fkey: string; decimal?: boolean }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={(form as any)[fkey]}
        onChangeText={v => setForm(p => ({ ...p, [fkey]: v }))}
        keyboardType={decimal ? 'decimal-pad' : 'default'} placeholderTextColor={COLORS.textSecondary} />
    </View>
  );

  const Row = ({ label, value, bold, highlight, sub }: any) => (
    <View style={styles.resultRow}>
      <Text style={[styles.resultLabel, bold && styles.bold, sub && styles.sub]}>{label}</Text>
      <Text style={[styles.resultValue, bold && styles.bold, highlight && { color: COLORS.gold }]}>
        ₺{value?.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Sekme başlıkları */}
      <View style={styles.tabBar}>
        {([['dashboard', 'grid', 'Dashboard'], ['calc', 'calculator', 'Hesaplayıcı']] as const).map(([key, icon, label]) => (
          <TouchableOpacity key={key} style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => setActiveTab(key)}>
            <Ionicons name={icon as any} size={16} color={activeTab === key ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.tabText, activeTab === key && { color: COLORS.primary }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: SIZES.padding }}>
        {activeTab === 'dashboard' ? (
          <>
            <Text style={styles.greeting}>Merhaba 👋</Text>
            <Text style={styles.subGreeting}>PrintPilot — 3D Baskı Yönetim Merkezi</Text>
            <View style={styles.statsGrid}>
              <QuickStatCard icon="receipt-outline" label="Sipariş" value={stats.orders} color={COLORS.primary} />
              <QuickStatCard icon="people-outline" label="Müşteri" value={stats.customers} color={COLORS.secondary} />
              <QuickStatCard icon="cash-outline" label="Gelir" value={'₺' + stats.revenue.toFixed(0)} color={COLORS.success} />
              <QuickStatCard icon="layers-outline" label="Stok" value={stats.stock} color={COLORS.warning} />
            </View>
            <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
            <TouchableOpacity style={styles.quickBtn} onPress={() => setActiveTab('calc')}>
              <Ionicons name="calculator" size={22} color={COLORS.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.quickBtnTitle}>Fiyat Hesapla</Text>
                <Text style={styles.quickBtnSub}>Maliyeti hesapla, teklif oluştur</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <View style={styles.tipCard}>
              <Ionicons name="bulb-outline" size={20} color={COLORS.gold} />
              <Text style={styles.tipText}>İpucu: Fire oranını (%10) hesaba katmayı unutma!</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>{t('calculator.title')}</Text>
            <Field label={t('calculator.filament_weight') + ' (g)'} fkey="filamentWeight" />
            <Field label="Filament Fiyatı (₺/kg)" fkey="filamentCostPerKg" />
            <Field label={t('calculator.print_time') + ' (saat)'} fkey="printTimeHours" />
            <Field label="Elektrik (₺/kWh)" fkey="electricityKwh" />
            <Field label="Yazıcı Gücü (W)" fkey="printerWatts" />
            <Field label="İşçilik (₺/saat)" fkey="laborHourly" />
            <Field label={t('calculator.failure_rate') + ' (%)'} fkey="failureRate" />
            <Field label={t('calculator.profit_margin') + ' (%)'} fkey="profitMargin" />
            <Field label="Komisyon (%)" fkey="commission" />
            <Field label="Ekstra Maliyet (₺)" fkey="extraCosts" />
            <View style={styles.switchRow}>
              <Text style={styles.label}>KDV Dahil Et (%{form.vatRate})</Text>
              <Switch value={form.includeVat} onValueChange={v => setForm(p => ({ ...p, includeVat: v }))}
                trackColor={{ false: COLORS.border, true: COLORS.primary }} />
            </View>
            <TouchableOpacity style={styles.calcBtn} onPress={handleCalc}>
              <Ionicons name="calculator" size={18} color="#fff" />
              <Text style={styles.calcBtnText}>{t('calculator.calculate')}</Text>
            </TouchableOpacity>
            {result && (
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>{t('calculator.result')}</Text>
                <Row label="Filament" value={result.filamentCost} sub />
                <Row label="Elektrik" value={result.electricityCost} sub />
                <Row label="İşçilik" value={result.laborCost} sub />
                <Row label="Fire" value={result.failureCost} sub />
                <View style={styles.divider} />
                <Row label={t('calculator.cost_price')} value={result.totalCost} bold />
                {result.vatAmount > 0 && <Row label="KDV" value={result.vatAmount} sub />}
                <Row label={t('calculator.sale_price')} value={result.finalPrice} bold highlight />
                <Row label="Kâr" value={result.profit} sub />
                <TouchableOpacity style={[styles.calcBtn, saved && styles.savedBtn, { marginTop: 14 }]} onPress={handleSave} disabled={saved}>
                  <Ionicons name={saved ? 'checkmark-circle' : 'save-outline'} size={18} color="#fff" />
                  <Text style={styles.calcBtnText}>{saved ? 'Kaydedildi!' : t('calculator.save_order')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { color: COLORS.textSecondary, fontSize: SIZES.sm, fontWeight: '600' },
  greeting: { fontSize: SIZES.xxl, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  subGreeting: { color: COLORS.textSecondary, fontSize: SIZES.sm, marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: 14, alignItems: 'center', gap: 4, borderLeftWidth: 4, borderWidth: 1, borderColor: COLORS.border },
  statValue: { fontSize: SIZES.xl, fontWeight: 'bold' },
  statLabel: { color: COLORS.textSecondary, fontSize: SIZES.xs },
  sectionTitle: { color: COLORS.text, fontWeight: 'bold', fontSize: SIZES.md, marginBottom: 10 },
  quickBtn: { backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  quickBtnTitle: { color: COLORS.text, fontWeight: 'bold', fontSize: SIZES.md },
  quickBtnSub: { color: COLORS.textSecondary, fontSize: SIZES.xs, marginTop: 2 },
  tipCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.gold + '11', borderRadius: SIZES.radius, padding: 14, borderWidth: 1, borderColor: COLORS.gold + '33' },
  tipText: { color: COLORS.textSecondary, fontSize: SIZES.sm, flex: 1 },
  title: { fontSize: SIZES.xxl, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
  field: { marginBottom: 12 },
  label: { color: COLORS.textSecondary, fontSize: SIZES.sm, marginBottom: 4 },
  input: { backgroundColor: COLORS.card, color: COLORS.text, borderRadius: SIZES.radius, padding: 12, fontSize: SIZES.md, borderWidth: 1, borderColor: COLORS.border },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calcBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius, padding: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 4 },
  savedBtn: { backgroundColor: COLORS.success },
  calcBtnText: { color: '#fff', fontWeight: 'bold', fontSize: SIZES.md },
  resultCard: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusLg, padding: 18, marginTop: 16, borderWidth: 1, borderColor: COLORS.border },
  resultTitle: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.text, marginBottom: 14 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  resultLabel: { color: COLORS.textSecondary, fontSize: SIZES.md },
  resultValue: { color: COLORS.text, fontSize: SIZES.md },
  bold: { fontWeight: 'bold', color: COLORS.text, fontSize: SIZES.lg },
  sub: { color: COLORS.textSecondary, fontSize: SIZES.sm },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
});