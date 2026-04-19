import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { getPrinters, addPrinter, deletePrinter } from '../../services/database';
import { t } from '../../constants/i18n';

export default function PrintersScreen() {
  const [printers, setPrinters] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', model: '', electricity_per_hour: '0.5', depreciation_per_hour: '1.0' });

  useEffect(() => { load(); }, []);
  const load = () => setPrinters(getPrinters() as any[]);

  const handleAdd = () => {
    if (!form.name.trim()) { Alert.alert('Hata', 'Yazıcı adı gerekli'); return; }
    addPrinter({
      name: form.name, model: form.model,
      electricity_per_hour: parseFloat(form.electricity_per_hour) || 0.5,
      depreciation_per_hour: parseFloat(form.depreciation_per_hour) || 1.0,
    });
    load(); setModal(false); setForm({ name: '', model: '', electricity_per_hour: '0.5', depreciation_per_hour: '1.0' });
  };

  const handleDelete = (id: number) => {
    Alert.alert('Sil', 'Bu yazıcıyı silmek istiyor musunuz?', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => { deletePrinter(id); load(); } }
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addBtnText}>{t('printers.add')}</Text>
      </TouchableOpacity>
      <FlatList
        data={printers}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={{ padding: SIZES.padding }}
        ListEmptyComponent={<Text style={styles.empty}>{t('printers.no_printers')}</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name="print" size={28} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.name}>{item.name}</Text>
              {item.model ? <Text style={styles.sub}>{item.model}</Text> : null}
              <View style={styles.stats}>
                <Text style={styles.stat}>⚡ {item.electricity_per_hour}₺/s</Text>
                <Text style={styles.stat}>🔧 {item.depreciation_per_hour}₺/s</Text>
                <Text style={styles.stat}>⏱ {item.total_hours || 0}s</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        )}
      />
      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('printers.add')}</Text>
            {[
              { key: 'name', placeholder: 'Yazıcı Adı *' },
              { key: 'model', placeholder: 'Model (örn: Bambu X1C)' },
              { key: 'electricity_per_hour', placeholder: 'Elektrik Maliyeti (₺/saat)' },
              { key: 'depreciation_per_hour', placeholder: 'Amortisman (₺/saat)' },
            ].map(f => (
              <TextInput key={f.key} style={styles.input} placeholder={f.placeholder}
                placeholderTextColor={COLORS.textSecondary}
                value={(form as any)[f.key]}
                onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                keyboardType={f.key.includes('hour') ? 'decimal-pad' : 'default'} />
            ))}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.border, flex: 1 }]} onPress={() => setModal(false)}>
                <Text style={{ color: COLORS.text }}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.primary, flex: 1 }]} onPress={handleAdd}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, margin: SIZES.margin, borderRadius: SIZES.radius, padding: 14, justifyContent: 'center', gap: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: SIZES.md },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  iconWrap: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary + '22', justifyContent: 'center', alignItems: 'center' },
  name: { color: COLORS.text, fontWeight: 'bold', fontSize: SIZES.md },
  sub: { color: COLORS.textSecondary, fontSize: SIZES.sm, marginTop: 2 },
  stats: { flexDirection: 'row', gap: 12, marginTop: 6 },
  stat: { color: COLORS.textSecondary, fontSize: SIZES.xs },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { color: COLORS.text, fontSize: SIZES.xl, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: COLORS.card, color: COLORS.text, borderRadius: SIZES.radius, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  btn: { borderRadius: SIZES.radius, padding: 14, alignItems: 'center' },
});