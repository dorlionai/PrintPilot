import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { getCustomers, addCustomer, deleteCustomer } from '../../services/database';
import { t } from '../../constants/i18n';

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  useEffect(() => { load(); }, []);
  const load = () => setCustomers(getCustomers() as any[]);

  const filtered = customers.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!form.name.trim()) { Alert.alert('Hata', 'İsim gerekli'); return; }
    addCustomer({ ...form, address: '', notes: '' });
    load(); setModal(false); setForm({ name: '', phone: '', email: '' });
  };

  const handleDelete = (id: number) => {
    Alert.alert('Sil', 'Bu müşteriyi silmek istiyor musunuz?', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => { deleteCustomer(id); load(); } }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput style={styles.search} placeholder={t('customers.search')} placeholderTextColor={COLORS.textSecondary} value={search} onChangeText={setSearch} />
        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={{ padding: SIZES.padding }}
        ListEmptyComponent={<Text style={styles.empty}>{t('customers.no_customers')}</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{item.name}</Text>
              {item.phone ? <Text style={styles.sub}>{item.phone}</Text> : null}
              <Text style={styles.sub}>{t('customers.last_seen')}: {item.last_seen?.slice(0, 10)}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        )}
      />
      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('customers.add')}</Text>
            {['name', 'phone', 'email'].map(k => (
              <TextInput key={k} style={styles.input} placeholder={k === 'name' ? 'İsim *' : k === 'phone' ? 'Telefon' : 'E-posta'}
                placeholderTextColor={COLORS.textSecondary} value={(form as any)[k]}
                onChangeText={v => setForm(p => ({ ...p, [k]: v }))} />
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
  header: { flexDirection: 'row', alignItems: 'center', margin: SIZES.margin, gap: 10 },
  search: { flex: 1, backgroundColor: COLORS.card, color: COLORS.text, borderRadius: SIZES.radius, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius, padding: 12 },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: SIZES.lg },
  name: { color: COLORS.text, fontWeight: 'bold', fontSize: SIZES.md },
  sub: { color: COLORS.textSecondary, fontSize: SIZES.sm, marginTop: 2 },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { color: COLORS.text, fontSize: SIZES.xl, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: COLORS.card, color: COLORS.text, borderRadius: SIZES.radius, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  btn: { borderRadius: SIZES.radius, padding: 14, alignItems: 'center' },
});