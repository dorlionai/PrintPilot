import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Switch, FlatList, Modal, StatusBar
} from 'react-native';

// ===== RENKLER =====
const C = {
  bg: '#0f0f1a', card: '#1a1a2e', surface: '#16213e',
  primary: '#6C5CE7', secondary: '#00CEC9', gold: '#F9CA24',
  success: '#00B894', error: '#E17055', warning: '#FDCB6E',
  text: '#FFFFFF', sub: '#A0A0B0', border: '#2D2D4E',
};

// ===== HESAPLAYICI =====
function hesapla(g: any) {
  const fw = Math.max(0, g.fw || 0);
  const cpk = Math.max(0, g.cpk || 0);
  const hrs = Math.max(0, g.hrs || 0);
  const ekwh = Math.max(0, g.ekwh || 0);
  const watts = Math.max(0, g.watts || 0);
  const fail = Math.min(100, Math.max(0, g.fail || 0));
  const labor = Math.max(0, g.labor || 0);
  const profit = Math.max(0, g.profit || 0);
  const comm = Math.min(100, Math.max(0, g.comm || 0));
  const vat = g.vat ? Math.min(100, Math.max(0, g.vatR || 20)) : 0;

  const filament = (fw / 1000) * cpk;
  const elektrik = (watts / 1000) * hrs * ekwh;
  const iscilik = hrs * labor;
  const base = filament + elektrik + iscilik + Math.max(0, g.extra || 0);
  const fire = base * (fail / 100);
  const maliyet = base + fire;
  const fiyat = maliyet * (1 + profit / 100);
  const komisyon = fiyat * (comm / 100);
  const kdv = (fiyat + komisyon) * (vat / 100);
  const satis = fiyat + komisyon + kdv;
  const kar = satis - maliyet - komisyon - kdv;
  const margin = satis > 0 ? (kar / satis) * 100 : 0;

  return {
    filament: Math.round(filament * 100) / 100,
    elektrik: Math.round(elektrik * 100) / 100,
    iscilik: Math.round(iscilik * 100) / 100,
    fire: Math.round(fire * 100) / 100,
    maliyet: Math.round(maliyet * 100) / 100,
    kdv: Math.round(kdv * 100) / 100,
    satis: Math.round(satis * 100) / 100,
    kar: Math.round(kar * 100) / 100,
    margin: Math.round(margin * 10) / 10,
  };
}

// ===== HESAPLAYICI EKRANI =====
function HesapScreen() {
  const [f, setF] = useState({
    fw: '50', cpk: '500', hrs: '3', ekwh: '2.5',
    watts: '200', fail: '10', labor: '50', profit: '30',
    comm: '0', extra: '0', vat: false, vatR: '20'
  });
  const [result, setResult] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  const calc = () => {
    const r = hesapla({
      fw: +f.fw, cpk: +f.cpk, hrs: +f.hrs, ekwh: +f.ekwh,
      watts: +f.watts, fail: +f.fail, labor: +f.labor, profit: +f.profit,
      comm: +f.comm, extra: +f.extra, vat: f.vat, vatR: +f.vatR
    });
    setResult(r); setSaved(false);
  };

  const Field = ({ label, k }: any) => (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput style={s.input} value={(f as any)[k]}
        onChangeText={v => setF((p: any) => ({ ...p, [k]: v }))}
        keyboardType="decimal-pad" placeholderTextColor={C.sub} />
    </View>
  );

  const Row = ({ label, val, bold, hi }: any) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
      <Text style={{ color: bold ? C.text : C.sub, fontWeight: bold ? 'bold' : 'normal', fontSize: bold ? 15 : 13 }}>{label}</Text>
      <Text style={{ color: hi ? C.gold : bold ? C.text : C.sub, fontWeight: bold ? 'bold' : 'normal', fontSize: bold ? 15 : 13 }}>
        ₺{val?.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title}>💰 Fiyat Hesaplayıcı</Text>
      <Field label="Filament Ağırlığı (g)" k="fw" />
      <Field label="Filament Fiyatı (₺/kg)" k="cpk" />
      <Field label="Baskı Süresi (saat)" k="hrs" />
      <Field label="Elektrik (₺/kWh)" k="ekwh" />
      <Field label="Yazıcı Gücü (W)" k="watts" />
      <Field label="İşçilik (₺/saat)" k="labor" />
      <Field label="Fire Oranı (%)" k="fail" />
      <Field label="Kar Marjı (%)" k="profit" />
      <Field label="Komisyon (%)" k="comm" />
      <Field label="Ekstra Maliyet (₺)" k="extra" />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={s.label}>KDV Dahil Et (%{f.vatR})</Text>
        <Switch value={f.vat} onValueChange={v => setF((p: any) => ({ ...p, vat: v }))}
          trackColor={{ false: C.border, true: C.primary }} thumbColor="#fff" />
      </View>
      <TouchableOpacity style={s.btn} onPress={calc}>
        <Text style={s.btnTxt}>Hesapla</Text>
      </TouchableOpacity>
      {result && (
        <View style={[s.card, { marginTop: 16 }]}>
          <Text style={[s.title, { fontSize: 16, marginBottom: 12 }]}>Sonuç</Text>
          <Row label="Filament" val={result.filament} />
          <Row label="Elektrik" val={result.elektrik} />
          <Row label="İşçilik" val={result.iscilik} />
          <Row label="Fire" val={result.fire} />
          <View style={{ height: 1, backgroundColor: C.border, marginVertical: 8 }} />
          <Row label="Maliyet" val={result.maliyet} bold />
          {result.kdv > 0 && <Row label="KDV" val={result.kdv} />}
          <Row label="Satış Fiyatı" val={result.satis} bold hi />
          <Row label={`Kâr (%${result.margin})`} val={result.kar} />
          <TouchableOpacity style={[s.btn, saved && { backgroundColor: C.success }, { marginTop: 12 }]}
            onPress={() => { setSaved(true); Alert.alert('✅', 'Sipariş kaydedildi!'); }}>
            <Text style={s.btnTxt}>{saved ? '✅ Kaydedildi' : '💾 Sipariş Kaydet'}</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ===== MÜŞTERİ EKRANI =====
function MusteriScreen() {
  const [list, setList] = useState([
    { id: 1, name: 'Ahmet Yılmaz', phone: '0532 111 22 33' },
    { id: 2, name: 'Fatma Kaya', phone: '0541 444 55 66' },
    { id: 3, name: 'Mehmet Demir', phone: '0555 777 88 99' },
  ]);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');

  const filtered = list.filter(x => x.name.toLowerCase().includes(search.toLowerCase()));

  const add = () => {
    if (!name.trim()) { Alert.alert('Hata', 'İsim gerekli'); return; }
    setList(p => [...p, { id: Date.now(), name, phone }]);
    setName(''); setPhone(''); setModal(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, flexDirection: 'row', gap: 10 }}>
        <TextInput style={[s.input, { flex: 1 }]} placeholder="Müşteri ara..."
          placeholderTextColor={C.sub} value={search} onChangeText={setSearch} />
        <TouchableOpacity style={[s.btn, { paddingHorizontal: 16, paddingVertical: 12 }]}
          onPress={() => setModal(true)}>
          <Text style={s.btnTxt}>+ Ekle</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={filtered} keyExtractor={i => String(i.id)} contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={<Text style={{ color: C.sub, textAlign: 'center', marginTop: 40 }}>Müşteri yok</Text>}
        renderItem={({ item }) => (
          <View style={[s.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 10 }]}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{item.name[0]}</Text>
            </View>
            <View>
              <Text style={{ color: C.text, fontWeight: 'bold' }}>{item.name}</Text>
              <Text style={{ color: C.sub, fontSize: 12 }}>{item.phone}</Text>
            </View>
          </View>
        )} />
      <Modal visible={modal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <Text style={[s.title, { marginBottom: 16 }]}>Yeni Müşteri</Text>
            <TextInput style={[s.input, { marginBottom: 10 }]} placeholder="İsim *"
              placeholderTextColor={C.sub} value={name} onChangeText={setName} />
            <TextInput style={[s.input, { marginBottom: 16 }]} placeholder="Telefon"
              placeholderTextColor={C.sub} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[s.btn, { flex: 1, backgroundColor: C.border }]} onPress={() => setModal(false)}>
                <Text style={[s.btnTxt, { color: C.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btn, { flex: 1 }]} onPress={add}>
                <Text style={s.btnTxt}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ===== İSTATİSTİK EKRANI =====
function IstatistikScreen() {
  const data = [
    { label: 'Bu Ay Sipariş', value: '24', color: C.primary, icon: '📦' },
    { label: 'Bu Ay Gelir', value: '₺8.450', color: C.success, icon: '💰' },
    { label: 'Ortalama Sipariş', value: '₺352', color: C.gold, icon: '📊' },
    { label: 'Toplam Müşteri', value: '12', color: C.secondary, icon: '👥' },
    { label: 'Aktif Yazıcı', value: '3', color: C.warning, icon: '🖨️' },
    { label: 'Stok Kalemi', value: '8', color: C.error, icon: '🧵' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title}>📊 İstatistikler</Text>
      <Text style={{ color: C.sub, marginBottom: 20 }}>Nisan 2026</Text>
      {data.map((d, i) => (
        <View key={i} style={[s.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderLeftWidth: 4, borderLeftColor: d.color }]}>
          <Text style={{ fontSize: 28, marginRight: 16 }}>{d.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.sub, fontSize: 12 }}>{d.label}</Text>
            <Text style={{ color: d.color, fontSize: 24, fontWeight: 'bold' }}>{d.value}</Text>
          </View>
        </View>
      ))}
      <View style={[s.card, { marginTop: 8 }]}>
        <Text style={{ color: C.text, fontWeight: 'bold', marginBottom: 12 }}>📈 Haftalık Trend</Text>
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((g, i) => {
          const vals = [3, 5, 2, 7, 4, 8, 1];
          const pct = (vals[i] / 8) * 100;
          return (
            <View key={g} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ color: C.sub, width: 30, fontSize: 12 }}>{g}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ width: pct + '%' as any, height: 8, backgroundColor: C.primary, borderRadius: 4 }} />
              </View>
              <Text style={{ color: C.sub, width: 20, fontSize: 11, textAlign: 'right' }}>{vals[i]}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ===== ADMIN EKRANI =====
function AdminScreen() {
  const [firma, setFirma] = useState('Dorlion 3D Baskı');
  const [bildirim, setBildirim] = useState(true);
  const [dark, setDark] = useState(true);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title}>⚙️ Admin Paneli</Text>
      <View style={[s.card, { marginBottom: 16 }]}>
        <Text style={s.sectionTitle}>ABONELİK</Text>
        <View style={{ alignItems: 'center', padding: 16 }}>
          <Text style={{ color: C.gold, fontSize: 22, fontWeight: 'bold' }}>🆓 Ücretsiz Plan</Text>
          <Text style={{ color: C.sub, marginTop: 4, fontSize: 13 }}>Günlük 5 hesaplama</Text>
          <TouchableOpacity style={[s.btn, { marginTop: 12, paddingHorizontal: 32 }]}
            onPress={() => Alert.alert('Premium', 'Standard ₺99/ay\nDealer ₺199/ay\n\nYakında aktif!')}>
            <Text style={s.btnTxt}>⭐ Premium'a Geç</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={[s.card, { marginBottom: 16 }]}>
        <Text style={s.sectionTitle}>AYARLAR</Text>
        <Text style={s.label}>Firma Adı</Text>
        <TextInput style={[s.input, { marginBottom: 16 }]} value={firma} onChangeText={setFirma} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: C.text }}>Bildirimler</Text>
          <Switch value={bildirim} onValueChange={setBildirim} trackColor={{ false: C.border, true: C.primary }} thumbColor="#fff" />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: C.text }}>Karanlık Tema</Text>
          <Switch value={dark} onValueChange={setDark} trackColor={{ false: C.border, true: C.primary }} thumbColor="#fff" />
        </View>
      </View>
      <TouchableOpacity style={s.btn} onPress={() => Alert.alert('✅', 'Ayarlar kaydedildi!')}>
        <Text style={s.btnTxt}>Kaydet</Text>
      </TouchableOpacity>
      <View style={[s.card, { marginTop: 16 }]}>
        <Text style={s.sectionTitle}>YASAL</Text>
        <TouchableOpacity style={{ paddingVertical: 10 }} onPress={() => Alert.alert('Gizlilik Politikası', 'Yakında eklenecek.')}>
          <Text style={{ color: C.primary }}>Gizlilik Politikası →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingVertical: 10 }} onPress={() => Alert.alert('Kullanım Şartları', 'Yakında eklenecek.')}>
          <Text style={{ color: C.primary }}>Kullanım Şartları →</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ color: C.border, textAlign: 'center', marginTop: 24, fontSize: 11 }}>
        PrintPilot v1.0.0 — Powered by Dorlion AI
      </Text>
    </ScrollView>
  );
}

// ===== TAB BAR =====
const TABS = [
  { key: 'hesap', label: 'Hesap', icon: '🧮' },
  { key: 'musteri', label: 'Müşteri', icon: '👥' },
  { key: 'istat', label: 'İstatistik', icon: '📊' },
  { key: 'admin', label: 'Admin', icon: '⚙️' },
];

// ===== ANA APP =====
export default function App() {
  const [tab, setTab] = useState('hesap');

  const Screen = () => {
    switch (tab) {
      case 'hesap': return <HesapScreen />;
      case 'musteri': return <MusteriScreen />;
      case 'istat': return <IstatistikScreen />;
      case 'admin': return <AdminScreen />;
      default: return <HesapScreen />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={{ backgroundColor: C.surface, paddingTop: 50, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <Text style={{ color: C.primary, fontSize: 20, fontWeight: 'bold' }}>🖨️ PrintPilot</Text>
        <Text style={{ color: C.sub, fontSize: 11 }}>3D Baskı Yönetim Merkezi</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Screen />
      </View>
      <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, paddingBottom: 20 }}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }} onPress={() => setTab(t.key)}>
            <Text style={{ fontSize: 20 }}>{t.icon}</Text>
            <Text style={{ color: tab === t.key ? C.primary : C.sub, fontSize: 10, marginTop: 2, fontWeight: tab === t.key ? 'bold' : 'normal' }}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ===== STİLLER =====
const s = StyleSheet.create({
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2D2D4E' },
  field: { marginBottom: 12 },
  label: { color: '#A0A0B0', fontSize: 12, marginBottom: 4 },
  input: { backgroundColor: '#16213e', color: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#2D2D4E', fontSize: 14 },
  btn: { backgroundColor: '#6C5CE7', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  sectionTitle: { color: '#A0A0B0', fontSize: 11, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1 },
});