import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { getSetting, setSetting } from '../../services/database';
import { t } from '../../constants/i18n';
import { getSubscriptionStatus } from '../../services/subscriptionService';

export default function AdminScreen() {
  const [companyName, setCompanyName] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [subscription, setSubscription] = useState<string>('free');

  useEffect(() => {
    setCompanyName(getSetting('company_name') || '');
    setNotifications(getSetting('notifications') !== 'false');
    setDarkMode(getSetting('dark_mode') !== 'false');
    getSubscriptionStatus().then(setSubscription);
  }, []);

  const save = () => {
    setSetting('company_name', companyName);
    setSetting('notifications', String(notifications));
    setSetting('dark_mode', String(darkMode));
    Alert.alert(t('common.success'), 'Ayarlar kaydedildi!');
  };

  const Section = ({ title, children }: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const Row = ({ label, children }: any) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {children}
    </View>
  );

  const planLabel = subscription === 'dealer' ? 'Dealer (199₺/ay)' : subscription === 'standard' ? 'Standard (99₺/ay)' : 'Ücretsiz';
  const planColor = subscription === 'dealer' ? COLORS.gold : subscription === 'standard' ? COLORS.primary : COLORS.textSecondary;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SIZES.padding }}>
      <Text style={styles.title}>{t('admin.title')}</Text>

      <Section title="Abonelik">
        <View style={[styles.planCard, { borderColor: planColor }]}>
          <Text style={[styles.planLabel, { color: planColor }]}>{planLabel}</Text>
          {subscription === 'free' && (
            <TouchableOpacity style={styles.upgradeBtn} onPress={() => Alert.alert('Yükselt', 'RevenueCat entegrasyonu tamamlandığında aktif olacak.')}>
              <Text style={styles.upgradeBtnText}>Premium'a Geç</Text>
            </TouchableOpacity>
          )}
        </View>
      </Section>

      <Section title={t('admin.company_name')}>
        <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} placeholder="Firma adınız" placeholderTextColor={COLORS.textSecondary} />
      </Section>

      <Section title="Ayarlar">
        <Row label={t('admin.notifications')}>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: COLORS.border, true: COLORS.primary }} />
        </Row>
        <Row label={t('admin.theme')}>
          <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: COLORS.border, true: COLORS.primary }} />
        </Row>
      </Section>

      <Section title="Yedekleme">
        <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Yedekle', 'Yakında: Firebase'e otomatik yedekleme')}>
          <Text style={styles.actionBtnText}>Buluta Yedekle</Text>
        </TouchableOpacity>
      </Section>

      <Section title="Yasal">
        <TouchableOpacity style={styles.linkBtn} onPress={() => Alert.alert('Gizlilik', 'Gizlilik politikası URL eklenecek')}>
          <Text style={styles.linkText}>Gizlilik Politikası</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => Alert.alert('Şartlar', 'Kullanım şartları URL eklenecek')}>
          <Text style={styles.linkText}>Kullanım Şartları</Text>
        </TouchableOpacity>
      </Section>

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveBtnText}>{t('common.save')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: SIZES.xxl, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 },
  section: { backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { color: COLORS.textSecondary, fontSize: SIZES.sm, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowLabel: { color: COLORS.text, fontSize: SIZES.md },
  input: { backgroundColor: COLORS.surface, color: COLORS.text, borderRadius: SIZES.radius, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  planCard: { borderRadius: SIZES.radius, borderWidth: 2, padding: 16, alignItems: 'center' },
  planLabel: { fontSize: SIZES.xl, fontWeight: 'bold' },
  upgradeBtn: { marginTop: 12, backgroundColor: COLORS.primary, borderRadius: SIZES.radius, paddingHorizontal: 20, paddingVertical: 10 },
  upgradeBtnText: { color: '#fff', fontWeight: 'bold' },
  actionBtn: { backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  actionBtnText: { color: COLORS.text, fontWeight: 'bold' },
  linkBtn: { paddingVertical: 10 },
  linkText: { color: COLORS.primary, fontSize: SIZES.md },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radiusLg, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 40 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: SIZES.lg },
});