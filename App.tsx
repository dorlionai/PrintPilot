import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Switch, FlatList, Modal, StatusBar, SafeAreaView
} from 'react-native';

const C = {
  bg: '#0f0f1a', card: '#1a1a2e', surface: '#16213e',
  primary: '#6C5CE7', secondary: '#00CEC9', gold: '#F9CA24',
  success: '#00B894', error: '#E17055', warning: '#FDCB6E',
  text: '#FFFFFF', sub: '#A0A0B0', border: '#2D2D4E',
};

function safe(n: number) {
  if (!isFinite(n) || isNaN(n)) return 0;
  return Math.round(n * 100) / 100;
}

function hesapla(g: any) {
  const fw = Math.max(0, +g.fw || 0);
  const cpk = Math.max(0, +g.cpk || 0);
  const hrs = Math.max(0.001, +g.hrs || 0.001);
  const ekwh = Math.max(0, +g.ekwh || 0);
  const watts = Math.max(0, +g.watts || 0);
  const fail = Math.min(99, Math.max(0, +g.fail || 0));
  const labor = Math.max(0, +g.labor || 0);
  const profit = Math.max(0, +g.profit || 0);
  const comm = Math.min(99, Math.max(0, +g.comm || 0));
  const extra = Math.max(0, +g.extra || 0);
  const vatR = g.vat ? Math.min(50, Math.max(0, +g.vatR || 20)) : 0;

  const filament = safe((fw / 1000) * cpk);
  const elektrik = safe((watts / 1000) * hrs * ekwh);
  const iscilik = safe(hrs * labor);
  const base = filament + elektrik + iscilik + extra;
  const fire = safe(base * (fail / 100));
  const maliyet = safe(base + fire);
  const fiyat = safe(maliyet * (1 + profit / 100));
  const komisyon = safe(fiyat * (comm / 100));
  const kdv = safe((fiyat + komisyon) * (vatR / 100));
  const satis = safe(fiyat + komisyon + kdv);
  const kar = safe(satis - maliyet - komisyon - kdv);
  const margin = satis > 0 ? safe((kar / satis) * 100) : 0;
  const breakEven = cpk > 0 ? safe((maliyet * 1000) / cpk) : 0;

  return { filament, elektrik, iscilik, fire, maliyet, kdv, satis, kar, margin, breakEven };
}

// ====== HESAPLAYICI ======
function HesapScreen({ onSave }: any) {
  const [f, setF] = useState({
    fw: '50', cpk: '500', hrs: '3', ekwh: '2.5',
    watts: '200', fail: '10', labor: '50', profit: '30',
    comm: '0', extra: '0', vat: false, vatR: '20',
    musteri: '', notlar: ''
  });
  const [result, setResult] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  const upd = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const calc = () => { setResult(hesapla(f)); setSaved(false); };

  const kaydet = () => {
    if (!result) return;
    onSave({
      id: Date.now(), musteri: f.musteri || 'Genel',
      filamentGr: +f.fw, sure: +f.hrs,
      maliyet: result.maliyet, satis: result.satis,
      kar: result.kar, tarih: new Date().toLocaleDateString('tr-TR'),
      durum: 'Bekliyor', notlar: f.notlar
    });
    setSaved(true);
    Alert.alert('✅ Kaydedildi', 'Sipariş geçmişine eklendi!');
  };

  const Field = ({ lbl, k, decimal = true }: any) => (
    <View style={s.field}>
      <Text style={s.lbl}>{lbl}</Text>
      <TextInput style={s.inp} value={(f as any)[k]}
        onChangeText={v => upd(k, v)}
        keyboardType={decimal ? 'decimal-pad' : 'default'}
        placeholderTextColor={C.sub} />
    </View>
  );

  const Row = ({ lbl, val, bold, hi, sub }: any) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
      <Text style={{ color: hi ? C.gold : bold ? C.text : C.sub, fontWeight: bold ? 'bold' : 'normal', fontSize: sub ? 12 : bold ? 15 : 13 }}>{lbl}</Text>
      <Text style={{ color: hi ? C.gold : bold ? C.text : C.sub, fontWeight: bold ? 'bold' : 'normal', fontSize: sub ? 12 : bold ? 15 : 13 }}>₺{val?.toFixed(2)}</Text>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title}>💰 Fiyat Hesaplayıcı</Text>

      <View style={s.card}>
        <Text style={s.secTitle}>MALZEME & BASKI</Text>
        <Field lbl="Filament Ağırlığı (gram)" k="fw" />
        <Field lbl="Filament Fiyatı (₺/kg)" k="cpk" />
        <Field lbl="Baskı Süresi (saat)" k="hrs" />
        <Field lbl="Yazıcı Gücü (Watt)" k="watts" />
        <Field lbl="Elektrik Fiyatı (₺/kWh)" k="ekwh" />
      </View>

      <View style={[s.card, { marginTop: 12 }]}>
        <Text style={s.secTitle}>MALİYET & KAR</Text>
        <Field lbl="İşçilik (₺/saat)" k="labor" />
        <Field lbl="Fire Oranı (%)" k="fail" />
        <Field lbl="Kar Marjı (%)" k="profit" />
        <Field lbl="Komisyon (%)" k="comm" />
        <Field lbl="Ekstra Maliyet (₺)" k="extra" />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <Text style={s.lbl}>KDV Dahil Et (%{f.vatR})</Text>
          <Switch value={f.vat} onValueChange={v => upd('vat', v)}
            trackColor={{ false: C.border, true: C.primary }} thumbColor="#fff" />
        </View>
      </View>

      <View style={[s.card, { marginTop: 12 }]}>
        <Text style={s.secTitle}>SİPARİŞ BİLGİSİ (opsiyonel)</Text>
        <TextInput style={[s.inp, { marginBottom: 10 }]} placeholder="Müşteri adı"
          placeholderTextColor={C.sub} value={f.musteri} onChangeText={v => upd('musteri', v)} />
        <TextInput style={s.inp} placeholder="Notlar"
          placeholderTextColor={C.sub} value={f.notlar} onChangeText={v => upd('notlar', v)} />
      </View>

      <TouchableOpacity style={[s.btn, { marginTop: 16 }]} onPress={calc}>
        <Text style={s.btnTxt}>🔢 Hesapla</Text>
      </TouchableOpacity>

      {result && (
        <View style={[s.card, { marginTop: 16 }]}>
          <Text style={[s.title, { fontSize: 16, marginBottom: 12 }]}>📊 Sonuç</Text>
          <Row lbl="Filament maliyeti" val={result.filament} sub />
          <Row lbl="Elektrik maliyeti" val={result.elektrik} sub />
          <Row lbl="İşçilik maliyeti" val={result.iscilik} sub />
          <Row lbl="Fire maliyeti" val={result.fire} sub />
          <View style={{ height: 1, backgroundColor: C.border, marginVertical: 8 }} />
          <Row lbl="Toplam Maliyet" val={result.maliyet} bold />
          {result.kdv > 0 && <Row lbl="KDV" val={result.kdv} sub />}
          <Row lbl="💰 Satış Fiyatı" val={result.satis} bold hi />
          <Row lbl={`Kâr (%${result.margin})`} val={result.kar} />
          {result.breakEven > 0 && (
            <View style={{ marginTop: 8, padding: 10, backgroundColor: C.surface, borderRadius: 8 }}>
              <Text style={{ color: C.sub, fontSize: 11 }}>
                Break-even: {result.breakEven.toFixed(0)}g filament gerekiyor
              </Text>
            </View>
          )}
          <TouchableOpacity style={[s.btn, saved && { backgroundColor: C.success }, { marginTop: 14 }]} onPress={kaydet}>
            <Text style={s.btnTxt}>{saved ? '✅ Kaydedildi!' : '💾 Sipariş Kaydet'}</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ====== SİPARİŞLER ======
function SiparisScreen({ siparisler, onDelete }: any) {
  const [search, setSearch] = useState('');
  const filtered = siparisler.filter((x: any) =>
    x.musteri.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TextInput style={[s.inp, { margin: 16 }]} placeholder="Sipariş ara..."
        placeholderTextColor={C.sub} value={search} onChangeText={setSearch} />
      <FlatList data={filtered} keyExtractor={(i: any) => String(i.id)}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48 }}>📋</Text>
            <Text style={{ color: C.sub, marginTop: 12 }}>Henüz sipariş yok</Text>
            <Text style={{ color: C.border, fontSize: 12, marginTop: 4 }}>Hesaplayıcıdan sipariş kaydedin</Text>
          </View>
        }
        renderItem={({ item }: any) => (
          <View style={[s.card, { marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: 'bold', fontSize: 15 }}>{item.musteri}</Text>
                <Text style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>{item.tarih} • {item.filamentGr}g • {item.sure}s</Text>
                {item.notlar ? <Text style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>📝 {item.notlar}</Text> : null}
              </View>
              <View style={[{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
                item.durum === 'Tamamlandı' ? { backgroundColor: C.success + '33' } : { backgroundColor: C.warning + '33' }]}>
                <Text style={{ color: item.durum === 'Tamamlandı' ? C.success : C.warning, fontSize: 11 }}>{item.durum}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <View>
                <Text style={{ color: C.sub, fontSize: 11 }}>Maliyet</Text>
                <Text style={{ color: C.text, fontWeight: 'bold' }}>₺{item.maliyet?.toFixed(2)}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: C.sub, fontSize: 11 }}>Satış</Text>
                <Text style={{ color: C.gold, fontWeight: 'bold', fontSize: 16 }}>₺{item.satis?.toFixed(2)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: C.sub, fontSize: 11 }}>Kâr</Text>
                <Text style={{ color: C.success, fontWeight: 'bold' }}>₺{item.kar?.toFixed(2)}</Text>
              </View>
            </View>
            <TouchableOpacity style={{ marginTop: 10, alignItems: 'center' }}
              onPress={() => Alert.alert('Sil', 'Bu siparişi silmek istiyor musunuz?', [
                { text: 'İptal', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => onDelete(item.id) }
              ])}>
              <Text style={{ color: C.error, fontSize: 12 }}>🗑️ Sil</Text>
            </TouchableOpacity>
          </View>
        )} />
    </View>
  );
}

// ====== MÜŞTERİLER ======
function MusteriScreen() {
  const [list, setList] = useState([
    { id: 1, ad: 'Ahmet Yılmaz', tel: '0532 111 22 33', mail: 'ahmet@email.com', siparis: 5 },
    { id: 2, ad: 'Fatma Kaya', tel: '0541 444 55 66', mail: 'fatma@email.com', siparis: 3 },
    { id: 3, ad: 'Mehmet Demir', tel: '0555 777 88 99', mail: '', siparis: 8 },
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ad: '', tel: '', mail: '' });
  const [search, setSearch] = useState('');

  const filtered = list.filter(x => x.ad.toLowerCase().includes(search.toLowerCase()));
  const upd = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  const ekle = () => {
    if (!form.ad.trim()) { Alert.alert('Hata', 'İsim gerekli'); return; }
    setList(p => [...p, { id: Date.now(), ad: form.ad, tel: form.tel, mail: form.mail, siparis: 0 }]);
    setForm({ ad: '', tel: '', mail: '' }); setModal(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, flexDirection: 'row', gap: 10 }}>
        <TextInput style={[s.inp, { flex: 1 }]} placeholder="Müşteri ara..."
          placeholderTextColor={C.sub} value={search} onChangeText={setSearch} />
        <TouchableOpacity style={[s.btn, { paddingHorizontal: 20 }]} onPress={() => setModal(true)}>
          <Text style={s.btnTxt}>+ Ekle</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={filtered} keyExtractor={i => String(i.id)} contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={<Text style={{ color: C.sub, textAlign: 'center', marginTop: 40 }}>Müşteri bulunamadı</Text>}
        renderItem={({ item }) => (
          <View style={[s.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 10 }]}>
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{item.ad[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: 'bold', fontSize: 15 }}>{item.ad}</Text>
              {item.tel ? <Text style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>📞 {item.tel}</Text> : null}
              {item.mail ? <Text style={{ color: C.sub, fontSize: 12 }}>✉️ {item.mail}</Text> : null}
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: C.primary, fontWeight: 'bold', fontSize: 20 }}>{item.siparis}</Text>
              <Text style={{ color: C.sub, fontSize: 10 }}>sipariş</Text>
            </View>
          </View>
        )} />
      <Modal visible={modal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={[s.title, { marginBottom: 16 }]}>👤 Yeni Müşteri</Text>
            <TextInput style={[s.inp, { marginBottom: 10 }]} placeholder="İsim *" placeholderTextColor={C.sub} value={form.ad} onChangeText={v => upd('ad', v)} />
            <TextInput style={[s.inp, { marginBottom: 10 }]} placeholder="Telefon" placeholderTextColor={C.sub} value={form.tel} onChangeText={v => upd('tel', v)} keyboardType="phone-pad" />
            <TextInput style={[s.inp, { marginBottom: 16 }]} placeholder="E-posta" placeholderTextColor={C.sub} value={form.mail} onChangeText={v => upd('mail', v)} keyboardType="email-address" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[s.btn, { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }]} onPress={() => setModal(false)}>
                <Text style={[s.btnTxt, { color: C.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btn, { flex: 1 }]} onPress={ekle}>
                <Text style={s.btnTxt}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ====== STOK ======
function StokScreen() {
  const [stok, setStok] = useState([
    { id: 1, ad: 'Bambu PLA Siyah', malzeme: 'PLA', renk: 'Siyah', toplam: 1000, kullanilan: 320, fiyat: 450 },
    { id: 2, ad: 'Esun PETG Şeffaf', malzeme: 'PETG', renk: 'Şeffaf', toplam: 1000, kullanilan: 750, fiyat: 520 },
    { id: 3, ad: 'Prusament ABS Gri', malzeme: 'ABS', renk: 'Gri', toplam: 500, kullanilan: 100, fiyat: 600 },
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ad: '', malzeme: 'PLA', toplam: '1000', fiyat: '500' });

  const malzemeler = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Resin'];

  const ekle = () => {
    if (!form.ad.trim()) { Alert.alert('Hata', 'Stok adı gerekli'); return; }
    setStok(p => [...p, { id: Date.now(), ad: form.ad, malzeme: form.malzeme, renk: '', toplam: +form.toplam, kullanilan: 0, fiyat: +form.fiyat }]);
    setForm({ ad: '', malzeme: 'PLA', toplam: '1000', fiyat: '500' }); setModal(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TouchableOpacity style={[s.btn, { margin: 16 }]} onPress={() => setModal(true)}>
        <Text style={s.btnTxt}>+ Stok Ekle</Text>
      </TouchableOpacity>
      <FlatList data={stok} keyExtractor={i => String(i.id)} contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => {
          const pct = Math.min(100, (item.kullanilan / item.toplam) * 100);
          const kalan = item.toplam - item.kullanilan;
          const renk = pct > 80 ? C.error : pct > 50 ? C.warning : C.success;
          return (
            <View style={[s.card, { marginBottom: 10 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <View>
                  <Text style={{ color: C.text, fontWeight: 'bold' }}>{item.ad}</Text>
                  <Text style={{ color: C.sub, fontSize: 12 }}>{item.malzeme} • ₺{item.fiyat}/kg</Text>
                </View>
                <Text style={{ color: renk, fontWeight: 'bold' }}>{kalan}g kalan</Text>
              </View>
              <View style={{ height: 8, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden', marginBottom: 4 }}>
                <View style={{ width: pct + '%' as any, height: 8, backgroundColor: renk, borderRadius: 4 }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: C.sub, fontSize: 11 }}>Kullanılan: {item.kullanilan}g</Text>
                <Text style={{ color: C.sub, fontSize: 11 }}>Toplam: {item.toplam}g</Text>
                <Text style={{ color: renk, fontSize: 11 }}>{pct.toFixed(0)}%</Text>
              </View>
            </View>
          );
        }} />
      <Modal visible={modal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={[s.title, { marginBottom: 16 }]}>🧵 Yeni Stok</Text>
            <TextInput style={[s.inp, { marginBottom: 10 }]} placeholder="Filament Adı *" placeholderTextColor={C.sub} value={form.ad} onChangeText={v => setForm(p => ({ ...p, ad: v }))} />
            <Text style={[s.lbl, { marginBottom: 8 }]}>Malzeme</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {malzemeler.map(m => (
                <TouchableOpacity key={m} onPress={() => setForm(p => ({ ...p, malzeme: m }))}
                  style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: form.malzeme === m ? C.primary : C.card, borderWidth: 1, borderColor: form.malzeme === m ? C.primary : C.border }}>
                  <Text style={{ color: form.malzeme === m ? '#fff' : C.sub, fontSize: 13 }}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput style={[s.inp, { marginBottom: 10 }]} placeholder="Toplam Ağırlık (g)" placeholderTextColor={C.sub} value={form.toplam} onChangeText={v => setForm(p => ({ ...p, toplam: v }))} keyboardType="decimal-pad" />
            <TextInput style={[s.inp, { marginBottom: 16 }]} placeholder="Fiyat (₺/kg)" placeholderTextColor={C.sub} value={form.fiyat} onChangeText={v => setForm(p => ({ ...p, fiyat: v }))} keyboardType="decimal-pad" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[s.btn, { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }]} onPress={() => setModal(false)}>
                <Text style={[s.btnTxt, { color: C.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btn, { flex: 1 }]} onPress={ekle}>
                <Text style={s.btnTxt}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ====== İSTATİSTİK ======
function IstatScreen({ siparisler }: any) {
  const bugun = new Date().toLocaleDateString('tr-TR');
  const buAy = new Date().getMonth();

  const aylikSiparisler = siparisler.filter((s: any) => {
    const t = new Date(s.tarih.split('.').reverse().join('-'));
    return t.getMonth() === buAy;
  });

  const toplamGelir = siparisler.reduce((t: number, s: any) => t + (s.satis || 0), 0);
  const toplamKar = siparisler.reduce((t: number, s: any) => t + (s.kar || 0), 0);
  const ayGelir = aylikSiparisler.reduce((t: number, s: any) => t + (s.satis || 0), 0);
  const ort = siparisler.length > 0 ? toplamGelir / siparisler.length : 0;

  const kartlar = [
    { icon: '📦', lbl: 'Toplam Sipariş', val: String(siparisler.length), color: C.primary },
    { icon: '📅', lbl: 'Bu Ay Sipariş', val: String(aylikSiparisler.length), color: C.secondary },
    { icon: '💰', lbl: 'Toplam Gelir', val: '₺' + toplamGelir.toFixed(0), color: C.success },
    { icon: '📈', lbl: 'Bu Ay Gelir', val: '₺' + ayGelir.toFixed(0), color: C.gold },
    { icon: '🏆', lbl: 'Toplam Kâr', val: '₺' + toplamKar.toFixed(0), color: C.warning },
    { icon: '📊', lbl: 'Ort. Sipariş', val: '₺' + ort.toFixed(0), color: C.error },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title}>📊 İstatistikler</Text>
      {kartlar.map((k, i) => (
        <View key={i} style={[s.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderLeftWidth: 4, borderLeftColor: k.color }]}>
          <Text style={{ fontSize: 28, marginRight: 16 }}>{k.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.sub, fontSize: 12 }}>{k.lbl}</Text>
            <Text style={{ color: k.color, fontSize: 22, fontWeight: 'bold' }}>{k.val}</Text>
          </View>
        </View>
      ))}
      {siparisler.length === 0 && (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={{ fontSize: 48 }}>📊</Text>
          <Text style={{ color: C.sub, marginTop: 12 }}>Henüz sipariş yok</Text>
          <Text style={{ color: C.border, fontSize: 12, marginTop: 4 }}>Hesaplayıcıdan sipariş kaydedin</Text>
        </View>
      )}
      {siparisler.length > 0 && (
        <View style={[s.card, { marginTop: 8 }]}>
          <Text style={[s.secTitle, { marginBottom: 12 }]}>SON SİPARİŞLER</Text>
          {siparisler.slice(-5).reverse().map((sp: any) => (
            <View key={sp.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border }}>
              <View>
                <Text style={{ color: C.text, fontSize: 13 }}>{sp.musteri}</Text>
                <Text style={{ color: C.sub, fontSize: 11 }}>{sp.tarih}</Text>
              </View>
              <Text style={{ color: C.gold, fontWeight: 'bold' }}>₺{sp.satis?.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ====== ADMIN ======
function AdminScreen() {
  const [firma, setFirma] = useState('Dorlion 3D Baskı');
  const [bildirim, setBildirim] = useState(true);
  const [dark, setDark] = useState(true);
  const [saved, setSaved] = useState(false);

  const kaydet = () => { setSaved(true); Alert.alert('✅', 'Ayarlar kaydedildi!'); setTimeout(() => setSaved(false), 2000); };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title}>⚙️ Admin Paneli</Text>

      <View style={[s.card, { marginBottom: 12 }]}>
        <Text style={s.secTitle}>ABONELİK</Text>
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <View style={{ backgroundColor: C.surface, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border, marginBottom: 12 }}>
            <Text style={{ color: C.sub }}>🆓 Ücretsiz Plan</Text>
          </View>
          <TouchableOpacity style={[s.btn, { paddingHorizontal: 32 }]}
            onPress={() => Alert.alert('💎 Premium', 'Standard Plan: ₺99/ay\n• Sınırsız hesaplama\n• PDF teklif\n• Reklamsız\n\nDealer Plan: ₺199/ay\n• Tüm özellikler\n• Öncelikli destek\n\nYakında aktif!')}>
            <Text style={s.btnTxt}>⭐ Premium'a Geç</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[s.card, { marginBottom: 12 }]}>
        <Text style={s.secTitle}>AYARLAR</Text>
        <Text style={s.lbl}>Firma Adı</Text>
        <TextInput style={[s.inp, { marginBottom: 16 }]} value={firma} onChangeText={setFirma} placeholderTextColor={C.sub} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}>
          <Text style={{ color: C.text }}>🔔 Bildirimler</Text>
          <Switch value={bildirim} onValueChange={setBildirim} trackColor={{ false: C.border, true: C.primary }} thumbColor="#fff" />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}>
          <Text style={{ color: C.text }}>🌙 Karanlık Tema</Text>
          <Switch value={dark} onValueChange={setDark} trackColor={{ false: C.border, true: C.primary }} thumbColor="#fff" />
        </View>
      </View>

      <TouchableOpacity style={[s.btn, saved && { backgroundColor: C.success }]} onPress={kaydet}>
        <Text style={s.btnTxt}>{saved ? '✅ Kaydedildi!' : '💾 Ayarları Kaydet'}</Text>
      </TouchableOpacity>

      <View style={[s.card, { marginTop: 12 }]}>
        <Text style={s.secTitle}>HAKKINDA</Text>
        {[['Gizlilik Politikası', 'Yakında eklenecek.'], ['Kullanım Şartları', 'Yakında eklenecek.'], ['Destek', 'dorlion.ai26@gmail.com']].map(([lbl, val]) => (
          <TouchableOpacity key={lbl} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border }}
            onPress={() => Alert.alert(lbl, val)}>
            <Text style={{ color: C.primary }}>{lbl} →</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ color: C.border, textAlign: 'center', marginTop: 24, marginBottom: 40, fontSize: 11 }}>
        PrintPilot v1.0.0{'
'}Powered by Dorlion AI 🤖
      </Text>
    </ScrollView>
  );
}

// ====== ANA UYGULAMA ======
const TABS = [
  { k: 'hesap', lbl: 'Hesap', ico: '🧮' },
  { k: 'siparis', lbl: 'Siparişler', ico: '📋' },
  { k: 'musteri', lbl: 'Müşteri', ico: '👥' },
  { k: 'stok', lbl: 'Stok', ico: '🧵' },
  { k: 'istat', lbl: 'İstatistik', ico: '📊' },
  { k: 'admin', lbl: 'Admin', ico: '⚙️' },
];

export default function App() {
  const [tab, setTab] = useState('hesap');
  const [siparisler, setSiparisler] = useState<any[]>([]);

  const onSave = (s: any) => setSiparisler(p => [s, ...p]);
  const onDelete = (id: number) => setSiparisler(p => p.filter(x => x.id !== id));

  const renderScreen = () => {
    switch (tab) {
      case 'hesap': return <HesapScreen onSave={onSave} />;
      case 'siparis': return <SiparisScreen siparisler={siparisler} onDelete={onDelete} />;
      case 'musteri': return <MusteriScreen />;
      case 'stok': return <StokScreen />;
      case 'istat': return <IstatScreen siparisler={siparisler} />;
      case 'admin': return <AdminScreen />;
      default: return <HesapScreen onSave={onSave} />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={{ backgroundColor: C.surface, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: C.primary, fontSize: 20, fontWeight: 'bold' }}>🖨️ PrintPilot</Text>
          <Text style={{ color: C.sub, fontSize: 10 }}>3D Baskı Yönetim Merkezi</Text>
        </View>
        <View style={{ backgroundColor: C.card, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
          <Text style={{ color: C.gold, fontSize: 11, fontWeight: 'bold' }}>⭐ {siparisler.length} Sipariş</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>{renderScreen()}</View>
      <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border }}>
        {TABS.map(t => (
          <TouchableOpacity key={t.k} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, paddingBottom: 4 }} onPress={() => setTab(t.k)}>
            <Text style={{ fontSize: 18 }}>{t.ico}</Text>
            <Text style={{ color: tab === t.k ? C.primary : C.sub, fontSize: 9, marginTop: 2, fontWeight: tab === t.k ? 'bold' : 'normal' }}>{t.lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#2D2D4E' },
  field: { marginBottom: 12 },
  lbl: { color: '#A0A0B0', fontSize: 12, marginBottom: 4 },
  inp: { backgroundColor: '#16213e', color: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#2D2D4E', fontSize: 14 },
  btn: { backgroundColor: '#6C5CE7', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  secTitle: { color: '#A0A0B0', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 12 },
});