import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { getStock, addStock, deleteStock } from '../../services/database';
import { t } from '../../constants/i18n';

const MATERIALS = ['PLA', 'ABS', 'PETG', 'TPU', 'ASA', 'Resin'];
const COLORS_LIST = ['Siyah', 'Beyaz', 'Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Gri', 'Turuncu'];

export default function StockScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', color: 'Siyah', material: 'PLA', weight_total: '1000', cost_per_kg: '500' });

  useEffect(() => { load(); }, []);
  const load = () => setItems(getStock() as any[]);

  const handleAdd = () => {
    if (!form.name.trim()) { Alert.alert('Hata', 'Stok adı gerekli'); return; }
    addStock({ ...form, weight_total: parseFloat(form.weight_total), cost_per_kg: parseFloat(form.cost_per_kg) });
    load(); setModal(false);
    setForm({ name: '', color: 'Siyah', material: 'PLA', weight_total: '1000', cost_per_kg: '500' });
  };

  const handleDelete = (id: number) => {
    Alert.alert('Sil', 'Bu stoku silmek istiyor musunuz?', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => { deleteStock(id); load(); } }
    ]);
  };

  const getUsagePercent = (item: any) => Math.min(100, ((item.weight_used || 0) / item.weight_total) * 100);
  const getUsageColor = (pct: number) => pct > 80 ? COLORS.error : pct > 50 ? COLORS.warning : COLORS.success;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addBtnText}>{t('stock.add')}</Text>
      </TouchableOpacity>
      <FlatList
        data={items}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={{ padding: SIZES.padding }}
        ListEmptyComponent={<Text style={styles.empty}>{t('stock.no_stock')}</Text>}
        renderItem={({ item }) => {
          const pct = getUsagePercent(item);
          const remaining = item.weight_total - (item.weight_used || 0);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.colorDot, { backgroundColor: item.color === 'Siyah' ? '#333' : item.color === 'Beyaz' ? '#eee' : item.color === 'Kırmızı' ? '#e74c3c' : item.color === 'Mavi' ? '#3498db' : item.color === 'Yeşil' ? '#2ecc71' : item.color === 'Sarı' ? '#f1c40f' : item.color === 'Turuncu' ? '#e67e22' : '#95a5a6' }]} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.sub}>{item.material} · {item.color} · ₺{item.cost_per_kg}/kg</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: pct + '%' as any, backgroundColor: getUsageColor(pct) }]} />
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.stat}>Kalan: {remaining.toFixed(0)}g</Text>
                <Text style={styles.stat}>Toplam: {item.weight_total}g</Text>
                <Text style={[styles.stat, { color: getUsageColor(pct) }]}>{pct.toFixed(0)}% kullanıldı</Text>
              </View>
            </View>
          );
        }}
      />
      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('stock.add')}</Text>
            <TextInput style={styles.input} placeholder="Filament Adı *" placeholderTextColor={COLORS.textSecondary}
              value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} />
            <Text style={styles.pickerLabel}>Malzeme</Text>
            <View style={styles.chips}>
              {MATERIALS.map(m => (
                <TouchableOpacity key={m} style={[styles.chip, form.material === m && styles.chipActive]} onPress={() => setForm(p => ({ ...p, material: m }))}>
                  <Text style={{ color: form.material === m ? '#fff' : COLORS.textSecondary, fontSize: SIZES.sm }}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Toplam Ağırlık (g)" placeholderTextColor={COLORS.textSecondary}
              keyboardType="decimal-pad" value={form.weight_total} onChangeText={v => setForm(p => ({ ...p, weight_total: v }))} />
            <TextInput style={styles.input} placeholder="Maliyet (₺/kg)" placeholderTextColor={COLORS.textSecondary}
              keyboardType="decimal-pad" value={form.cost_per_kg} onChangeText={v => setForm(p => ({ ...p, cost_per_kg: v }))} />
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
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, margin: SIZES.margin, borderRadius: SIZES.radius, padding: 14, justifyContent: 'center', gap: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: SIZES.md },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  colorDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: COLORS.border },
  name: { color: COLORS.text, fontWeight: 'bold', fontSize: SIZES.md },
  sub: { color: COLORS.textSecondary, fontSize: SIZES.sm, marginTop: 2 },
  progressBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: 6, borderRadius: 3 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { color: COLORS.textSecondary, fontSize: SIZES.xs },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { color: COLORS.text, fontSize: SIZES.xl, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: COLORS.card, color: COLORS.text, borderRadius: SIZES.radius, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  pickerLabel: { color: COLORS.textSecondary, fontSize: SIZES.sm, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  btn: { borderRadius: SIZES.radius, padding: 14, alignItems: 'center' },
});