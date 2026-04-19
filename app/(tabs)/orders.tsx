import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { getOrders, deleteOrder } from '../../services/database';
import { t } from '../../constants/i18n';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);
  const load = () => setOrders(getOrders() as any[]);

  const filtered = orders.filter(o =>
    o.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    Alert.alert('Sil', 'Bu siparişi silmek istiyor musunuz?', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => { deleteOrder(id); load(); } }
    ]);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.customerName}>{item.customer_name || 'Genel'}</Text>
        <Text style={styles.detail}>₺{item.sale_price?.toFixed(2)} · {item.filament_weight}g · {item.print_time}s</Text>
        <Text style={styles.date}>{item.created_at?.slice(0, 16)}</Text>
      </View>
      <View style={styles.cardRight}>
        <View style={[styles.badge, { backgroundColor: item.status === 'completed' ? COLORS.success + '33' : COLORS.warning + '33' }]}>
          <Text style={{ color: item.status === 'completed' ? COLORS.success : COLORS.warning, fontSize: 10 }}>
            {item.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginTop: 8 }}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput style={styles.search} placeholder={t('orders.search')} placeholderTextColor={COLORS.textSecondary} value={search} onChangeText={setSearch} />
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={{ padding: SIZES.padding }}
        ListEmptyComponent={<Text style={styles.empty}>{t('orders.no_orders')}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  search: { margin: SIZES.margin, backgroundColor: COLORS.card, color: COLORS.text, borderRadius: SIZES.radius, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: COLORS.border },
  cardLeft: { flex: 1 },
  cardRight: { alignItems: 'flex-end' },
  customerName: { color: COLORS.text, fontWeight: 'bold', fontSize: SIZES.md },
  detail: { color: COLORS.textSecondary, fontSize: SIZES.sm, marginTop: 4 },
  date: { color: COLORS.textSecondary, fontSize: SIZES.xs, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 },
});