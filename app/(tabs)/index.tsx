import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { calculate, CalcInput } from '../../services/calculator';
import { t } from '../../constants/i18n';
import { addOrder } from '../../services/database';

export default function CalculatorScreen() {
  const [form, setForm] = useState({
    filamentWeight: '50',
    filamentCostPerKg: '500',
    printTimeHours: '3',
    electricityKwh: '2.5',
    printerWatts: '200',
    failureRate: '10',
    laborHourly: '50',
    profitMargin: '30',
    commission: '0',
    vatRate: '20',
    includeVat: false,
    extraCosts: '0',
  });
  const [result, setResult] = useState<any>(null);

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
    setResult(calculate(input));
  };

  const handleSave = () => {
    if (!result) return;
    addOrder({ customer_name: 'Genel', filament_weight: parseFloat(form.filamentWeight), print_time: parseFloat(form.printTimeHours), cost_price: result.totalCost, sale_price: result.finalPrice, notes: '' });
    Alert.alert(t('common.success'), 'Sipariş kaydedildi!');
  };

  const Field = ({ label, key }: { label: string, key: string }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={(form as any)[key]} onChangeText={v => setForm(p => ({...p, [key]: v}))} keyboardType="decimal-pad" placeholderTextColor={COLORS.textSecondary} />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SIZES.padding }}>
      <Text style={styles.title}>{t('calculator.title')}</Text>
      <Field label={t('calculator.filament_weight')} key="filamentWeight" />
      <Field label="Filament Fiyatı (₺/kg)" key="filamentCostPerKg" />
      <Field label={t('calculator.print_time')} key="printTimeHours" />
      <Field label={t('calculator.electricity_cost')} key="electricityKwh" />
      <Field label="Yazıcı Gücü (W)" key="printerWatts" />
      <Field label="İşçilik (₺/saat)" key="laborHourly" />
      <Field label={t('calculator.failure_rate')} key="failureRate" />
      <Field label={t('calculator.profit_margin')} key="profitMargin" />
      <Field label={t('calculator.commission')} key="commission" />
      <Field label="Ekstra Maliyet (₺)" key="extraCosts" />
      <View style={styles.switchRow}>
        <Text style={styles.label}>{t('calculator.include_vat')} (%{form.vatRate})</Text>
        <Switch value={form.includeVat} onValueChange={v => setForm(p => ({...p, includeVat: v}))} trackColor={{ false: COLORS.border, true: COLORS.primary }} />
      </View>
      <TouchableOpacity style={styles.btn} onPress={handleCalc}>
        <Text style={styles.btnText}>{t('calculator.calculate')}</Text>
      </TouchableOpacity>
      {result && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>{t('calculator.result')}</Text>
          <Row label="Filament" value={result.filamentCost} />
          <Row label="Elektrik" value={result.electricityCost} />
          <Row label="İşçilik" value={result.laborCost} />
          <Row label="Fire" value={result.failureCost} />
          <Row label={t('calculator.cost_price')} value={result.totalCost} bold />
          <Row label="KDV" value={result.vatAmount} />
          <Row label={t('calculator.sale_price')} value={result.finalPrice} bold highlight />
          <Row label="Kar" value={result.profit} />
          <TouchableOpacity style={[styles.btn, { marginTop: 12 }]} onPress={handleSave}>
            <Text style={styles.btnText}>{t('calculator.save_order')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function Row({ label, value, bold, highlight }: any) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ color: bold ? COLORS.text : COLORS.textSecondary, fontWeight: bold ? 'bold' : 'normal' }}>{label}</Text>
      <Text style={{ color: highlight ? COLORS.gold : bold ? COLORS.text : COLORS.textSecondary, fontWeight: bold ? 'bold' : 'normal' }}>₺{value?.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: SIZES.xxl, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 },
  field: { marginBottom: 12 },
  label: { color: COLORS.textSecondary, fontSize: SIZES.sm, marginBottom: 4 },
  input: { backgroundColor: COLORS.card, color: COLORS.text, borderRadius: SIZES.radius, padding: 12, fontSize: SIZES.md, borderWidth: 1, borderColor: COLORS.border },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  btn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: SIZES.md },
  result: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusLg, padding: 16, marginTop: 16 },
  resultTitle: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
});