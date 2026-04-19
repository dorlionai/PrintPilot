import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Switch, FlatList, Modal, StatusBar,
  SafeAreaView, Share, Linking, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== RENKLER =====
const C = {
  bg: '#0f0f1a', card: '#1a1a2e', surface: '#16213e',
  primary: '#6C5CE7', secondary: '#00CEC9', gold: '#F9CA24',
  success: '#00B894', error: '#E17055', warning: '#FDCB6E',
  text: '#FFFFFF', sub: '#A0A0B0', border: '#2D2D4E',
};

// ===== VERİ YÖNETIMI - AsyncStorage =====
const KEYS = {
  siparisler: 'pp_siparisler',
  musteriler: 'pp_musteriler',
  stok: 'pp_stok',
  ayarlar: 'pp_ayarlar',
  onboarding: 'pp_onboarding',
  gunlukCalc: 'pp_gunluk_calc',
};

async function loadData(key: string, fallback: any) {
  try {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

async function saveData(key: string, data: any) {
  try { await AsyncStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// ===== HESAPLAYICI =====
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

  return { filament, elektrik, iscilik, fire, maliyet, kdv, satis, kar, margin };
}

// ===== ONBOARDING =====
function OnboardingScreen({ onDone }: any) {
  const [step, setStep] = useState(0);
  const slides = [
    { icon: '🖨️', title: 'PrintPilot'a Hoş Geldin!', text: '3D baskı işletmeni için tüm yönetim tek ekranda. Maliyet hesapla, sipariş takip et, müşteri yönet.' },
    { icon: '💰', title: 'Doğru Fiyat, Daha Fazla Kâr', text: 'Filament, elektrik, işçilik, fire ve KDV dahil gerçek maliyet hesabı. Artık zarar etme!' },
    { icon: '📋', title: 'Siparişleri Takip Et', text: 'Her siparişi kaydet, PDF teklif oluştur, WhatsApp ile müşteriye gönder.' },
    { icon: '📦', title: 'Stok Kontrolü', text: 'Filament stoğunu takip et, kritik seviyede uyarı al. Asla malzeme bitmeden sürprizle karşılaşma.' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <Text style={{ fontSize: 80, marginBottom: 24 }}>{slides[step].icon}</Text>
      <Text style={{ color: C.text, fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>{slides[step].title}</Text>
      <Text style={{ color: C.sub, fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 40 }}>{slides[step].text}</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 40 }}>
        {slides.map((_, i) => (
          <View key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i === step ? C.primary : C.border }} />
        ))}
      </View>
      <TouchableOpacity style={[{ backgroundColor: C.primary, borderRadius: 14, paddingHorizontal: 40, paddingVertical: 16, width: '100%', alignItems: 'center' }]}
        onPress={() => step < slides.length - 1 ? setStep(step + 1) : onDone()}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>{step < slides.length - 1 ? 'Devam →' : '🚀 Başla'}</Text>
      </TouchableOpacity>
      {step > 0 && (
        <TouchableOpacity style={{ marginTop: 16 }} onPress={onDone}>
          <Text style={{ color: C.sub, fontSize: 14 }}>Atla</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ===== HESAPLAYICI EKRANI =====
function HesapScreen({ onSave, isPremium, gunlukCalc, setGunlukCalc }: any) {
  const [form, setForm] = useState({
    fw: '50', cpk: '500', hrs: '3', ekwh: '2.5',
    watts: '200', fail: '10', labor: '50', profit: '30',
    comm: '0', extra: '0', vat: false, vatR: '20',
    musteri: '', aciklama: ''
  });
  const [result, setResult] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [sharing, setSharing] = useState(false);

  const upd = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const LIMIT = 5;
  const gunKalan = Math.max(0, LIMIT - gunlukCalc);

  const calc = () => {
    if (!isPremium && gunlukCalc >= LIMIT) {
      Alert.alert('⭐ Premium Gerekli', 'Günlük ücretsiz hesaplama limitine ulaştınız (5/5).\n\nStandard plan ile sınırsız hesaplayın!',
        [{ text: 'Tamam', style: 'cancel' }]);
      return;
    }
    setResult(hesapla(form));
    setSaved(false);
    if (!isPremium) {
      const yeni = gunlukCalc + 1;
      setGunlukCalc(yeni);
      saveData(KEYS.gunlukCalc, { count: yeni, date: new Date().toDateString() });
    }
  };

  const kaydet = () => {
    if (!result) return;
    const siparis = {
      id: Date.now(), musteri: form.musteri || 'Genel',
      aciklama: form.aciklama, filamentGr: +form.fw, sure: +form.hrs,
      maliyet: result.maliyet, satis: result.satis, kar: result.kar,
      tarih: new Date().toLocaleDateString('tr-TR'),
      durum: 'Bekliyor', detay: form
    };
    onSave(siparis);
    setSaved(true);
    Alert.alert('✅ Kaydedildi!', 'Sipariş geçmişine eklendi.');
  };

  const whatsappPaylas = async () => {
    if (!result) return;
    setSharing(true);
    const mesaj = `🖨️ *PrintPilot - Fiyat Teklifi*

Müşteri: ${form.musteri || 'Genel'}
Açıklama: ${form.aciklama || '-'}

📊 *Hesap Detayı:*
• Filament: ${form.fw}g
• Baskı Süresi: ${form.hrs} saat
• Maliyet: ₺${result.maliyet.toFixed(2)}
${result.kdv > 0 ? '• KDV: ₺' + result.kdv.toFixed(2) : ''}

💰 *Satış Fiyatı: ₺${result.satis.toFixed(2)}*

_PrintPilot ile hesaplandı_`;

    try {
      const url = `whatsapp://send?text=${encodeURIComponent(mesaj)}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Share.share({ message: mesaj, title: 'PrintPilot Fiyat Teklifi' });
      }
    } catch { Alert.alert('Hata', 'Paylaşım açılamadı'); }
    setSharing(false);
  };

  const Field = ({ lbl, k, decimal = true }: any) => (
    <View style={s.field}>
      <Text style={s.lbl}>{lbl}</Text>
      <TextInput style={s.inp} value={(form as any)[k]}
        onChangeText={v => upd(k, v)} keyboardType={decimal ? 'decimal-pad' : 'default'}
        placeholderTextColor={C.sub} />
    </View>
  );

  const Row = ({ lbl, val, bold, hi }: any) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
      <Text style={{ color: hi ? C.gold : bold ? C.text : C.sub, fontWeight: bold ? 'bold' : 'normal', fontSize: bold ? 15 : 13 }}>{lbl}</Text>
      <Text style={{ color: hi ? C.gold : bold ? C.text : C.sub, fontWeight: bold ? 'bold' : 'normal', fontSize: bold ? 15 : 13 }}>₺{val?.toFixed(2)}</Text>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={s.title}>💰 Hesaplayıcı</Text>
        {!isPremium && (
          <View style={{ backgroundColor: gunKalan <= 1 ? C.error + '22' : C.primary + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
            <Text style={{ color: gunKalan <= 1 ? C.error : C.primary, fontSize: 12, fontWeight: 'bold' }}>
              {gunKalan}/{LIMIT} hak
            </Text>
          </View>
        )}
      </View>

      <View style={s.card}>
        <Text style={s.secTitle}>SİPARİŞ BİLGİSİ</Text>
        <TextInput style={[s.inp, { marginBottom: 10 }]} placeholder="Müşteri adı (opsiyonel)"
          placeholderTextColor={C.sub} value={form.musteri} onChangeText={v => upd('musteri', v)} />
        <TextInput style={s.inp} placeholder="Açıklama (opsiyonel)"
          placeholderTextColor={C.sub} value={form.aciklama} onChangeText={v => upd('aciklama', v)} />
      </View>

      <View style={[s.card, { marginTop: 12 }]}>
        <Text style={s.secTitle}>MALZEME & BASKI</Text>
        <Field lbl="Filament (gram)" k="fw" />
        <Field lbl="Filament Fiyatı (₺/kg)" k="cpk" />
        <Field lbl="Baskı Süresi (saat)" k="hrs" />
        <Field lbl="Yazıcı Gücü (Watt)" k="watts" />
        <Field lbl="Elektrik (₺/kWh)" k="ekwh" />
      </View>

      <View style={[s.card, { marginTop: 12 }]}>
        <Text style={s.secTitle}>MALİYET & KÂR</Text>
        <Field lbl="İşçilik (₺/saat)" k="labor" />
        <Field lbl="Fire Oranı (%)" k="fail" />
        <Field lbl="Kâr Marjı (%)" k="profit" />
        <Field lbl="Komisyon (%)" k="comm" />
        <Field lbl="Ekstra Maliyet (₺)" k="extra" />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Text style={s.lbl}>KDV Dahil (%{form.vatR})</Text>
          <Switch value={form.vat} onValueChange={v => upd('vat', v)}
            trackColor={{ false: C.border, true: C.primary }} thumbColor="#fff" />
        </View>
      </View>

      <TouchableOpacity style={[s.btn, { marginTop: 16 }, !isPremium && gunlukCalc >= LIMIT && { backgroundColor: C.border }]}
        onPress={calc} disabled={!isPremium && gunlukCalc >= LIMIT}>
        <Text style={s.btnTxt}>{!isPremium && gunlukCalc >= LIMIT ? '⭐ Premium ile Hesapla' : '🔢 Hesapla'}</Text>
      </TouchableOpacity>

      {result && (
        <View style={[s.card, { marginTop: 16 }]}>
          <Text style={[s.title, { fontSize: 16, marginBottom: 14 }]}>📊 Sonuç</Text>
          <Row lbl="Filament" val={result.filament} />
          <Row lbl="Elektrik" val={result.elektrik} />
          <Row lbl="İşçilik" val={result.iscilik} />
          <Row lbl="Fire (%{form.fail})" val={result.fire} />
          <View style={{ height: 1, backgroundColor: C.border, marginVertical: 10 }} />
          <Row lbl="Toplam Maliyet" val={result.maliyet} bold />
          {result.kdv > 0 && <Row lbl="KDV" val={result.kdv} />}
          <Row lbl="💰 Satış Fiyatı" val={result.satis} bold hi />
          <Row lbl={`Kâr (%${result.margin})`} val={result.kar} />

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <TouchableOpacity style={[s.btn, { flex: 1, backgroundColor: saved ? C.success : C.primary }]} onPress={kaydet}>
              <Text style={s.btnTxt}>{saved ? '✅ Kaydedildi' : '💾 Kaydet'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, { flex: 1, backgroundColor: '#25D366' }]} onPress={whatsappPaylas} disabled={sharing}>
              {sharing ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>📱 WhatsApp</Text>}
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[s.btn, { marginTop: 8, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }]}
            onPress={() => {
              const mesaj = `PrintPilot Fiyat Teklifi\nMaliyet: ₺${result.maliyet.toFixed(2)}\nSatış Fiyatı: ₺${result.satis.toFixed(2)}\nKâr: ₺${result.kar.toFixed(2)}`;
              Share.share({ message: mesaj, title: 'PrintPilot Fiyat Teklifi' });
            }}>
            <Text style={[s.btnTxt, { color: C.text }]}>📤 Diğer Uygulama ile Paylaş</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ===== SİPARİŞLER =====
function SiparisScreen({ siparisler, setSiparisler }: any) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tümü');
  const durumlar = ['Tümü', 'Bekliyor', 'Üretimde', 'Tamamlandı'];

  const filtered = siparisler.filter((x: any) => {
    const searchOk = x.musteri.toLowerCase().includes(search.toLowerCase()) ||
      (x.aciklama || '').toLowerCase().includes(search.toLowerCase());
    const filterOk = filter === 'Tümü' || x.durum === filter;
    return searchOk && filterOk;
  });

  const durumDegistir = (id: number, yeniDurum: string) => {
    const yeni = siparisler.map((s: any) => s.id === id ? { ...s, durum: yeniDurum } : s);
    setSiparisler(yeni);
    saveData(KEYS.siparisler, yeni);
  };

  const sil = (id: number) => {
    Alert.alert('Sil', 'Bu siparişi silmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => {
        const yeni = siparisler.filter((s: any) => s.id !== id);
        setSiparisler(yeni);
        saveData(KEYS.siparisler, yeni);
      }}
    ]);
  };

  const durumRenk: any = { 'Bekliyor': C.warning, 'Üretimde': C.primary, 'Tamamlandı': C.success };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <TextInput style={s.inp} placeholder="Sipariş veya müşteri ara..."
          placeholderTextColor={C.sub} value={search} onChangeText={setSearch} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {durumlar.map(d => (
            <TouchableOpacity key={d} onPress={() => setFilter(d)}
              style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8,
                backgroundColor: filter === d ? C.primary : C.card, borderWidth: 1,
                borderColor: filter === d ? C.primary : C.border }}>
              <Text style={{ color: filter === d ? '#fff' : C.sub, fontSize: 13 }}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList data={filtered} keyExtractor={(i: any) => String(i.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48 }}>📋</Text>
            <Text style={{ color: C.sub, marginTop: 12, fontSize: 15 }}>Sipariş bulunamadı</Text>
            <Text style={{ color: C.border, fontSize: 12, marginTop: 4 }}>Hesaplayıcıdan sipariş kaydedin</Text>
          </View>
        }
        renderItem={({ item }: any) => (
          <View style={[s.card, { marginBottom: 12 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: 'bold', fontSize: 15 }}>{item.musteri}</Text>
                {item.aciklama ? <Text style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>📝 {item.aciklama}</Text> : null}
                <Text style={{ color: C.border, fontSize: 11, marginTop: 2 }}>📅 {item.tarih} • {item.filamentGr}g • {item.sure}s</Text>
              </View>
              <View style={[{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
                { backgroundColor: (durumRenk[item.durum] || C.sub) + '22' }]}>
                <Text style={{ color: durumRenk[item.durum] || C.sub, fontSize: 11, fontWeight: 'bold' }}>{item.durum}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.surface, borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: C.sub, fontSize: 10 }}>Maliyet</Text>
                <Text style={{ color: C.text, fontWeight: 'bold' }}>₺{item.maliyet?.toFixed(2)}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: C.sub, fontSize: 10 }}>Satış</Text>
                <Text style={{ color: C.gold, fontWeight: 'bold', fontSize: 17 }}>₺{item.satis?.toFixed(2)}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: C.sub, fontSize: 10 }}>Kâr</Text>
                <Text style={{ color: C.success, fontWeight: 'bold' }}>₺{item.kar?.toFixed(2)}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {['Bekliyor', 'Üretimde', 'Tamamlandı'].map(d => (
                <TouchableOpacity key={d} onPress={() => durumDegistir(item.id, d)}
                  style={{ flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center',
                    backgroundColor: item.durum === d ? (durumRenk[d] + '33') : C.surface,
                    borderWidth: 1, borderColor: item.durum === d ? durumRenk[d] : C.border }}>
                  <Text style={{ color: item.durum === d ? durumRenk[d] : C.sub, fontSize: 10, fontWeight: 'bold' }}>{d}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => sil(item.id)}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: C.error + '22', borderWidth: 1, borderColor: C.error + '55', justifyContent: 'center' }}>
                <Text style={{ color: C.error, fontSize: 12 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )} />
    </View>
  );
}

// ===== MÜŞTERİLER =====
function MusteriScreen({ musteriler, setMusteriler }: any) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ad: '', tel: '', mail: '', adres: '' });
  const [search, setSearch] = useState('');

  const filtered = musteriler.filter((x: any) =>
    x.ad.toLowerCase().includes(search.toLowerCase()) ||
    (x.tel || '').includes(search)
  );

  const ekle = () => {
    if (!form.ad.trim()) { Alert.alert('Hata', 'İsim gerekli'); return; }
    const yeni = [...musteriler, { id: Date.now(), ...form, siparisSayisi: 0, kayitTarihi: new Date().toLocaleDateString('tr-TR') }];
    setMusteriler(yeni); saveData(KEYS.musteriler, yeni);
    setForm({ ad: '', tel: '', mail: '', adres: '' }); setModal(false);
  };

  const sil = (id: number) => {
    Alert.alert('Sil', 'Bu müşteriyi silmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => {
        const yeni = musteriler.filter((m: any) => m.id !== id);
        setMusteriler(yeni); saveData(KEYS.musteriler, yeni);
      }}
    ]);
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
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48 }}>👥</Text>
            <Text style={{ color: C.sub, marginTop: 12 }}>Henüz müşteri yok</Text>
            <Text style={{ color: C.border, fontSize: 12, marginTop: 4 }}>Yukarıdan ekleyin</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[s.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 10 }]}>
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{item.ad[0].toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: 'bold', fontSize: 15 }}>{item.ad}</Text>
              {item.tel ? <Text style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>📞 {item.tel}</Text> : null}
              {item.mail ? <Text style={{ color: C.sub, fontSize: 12 }}>✉️ {item.mail}</Text> : null}
              <Text style={{ color: C.border, fontSize: 11, marginTop: 2 }}>Kayıt: {item.kayitTarihi}</Text>
            </View>
            <TouchableOpacity onPress={() => sil(item.id)} style={{ padding: 8 }}>
              <Text style={{ color: C.error }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )} />
      <Modal visible={modal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={[s.title, { marginBottom: 16 }]}>👤 Yeni Müşteri</Text>
            {[
              { k: 'ad', ph: 'İsim Soyisim *' },
              { k: 'tel', ph: 'Telefon', kb: 'phone-pad' },
              { k: 'mail', ph: 'E-posta', kb: 'email-address' },
              { k: 'adres', ph: 'Adres (opsiyonel)' },
            ].map(f => (
              <TextInput key={f.k} style={[s.inp, { marginBottom: 10 }]} placeholder={f.ph}
                placeholderTextColor={C.sub} value={(form as any)[f.k]}
                onChangeText={v => setForm((p: any) => ({ ...p, [f.k]: v }))}
                keyboardType={(f.kb as any) || 'default'} />
            ))}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
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

// ===== STOK =====
function StokScreen({ stok, setStok }: any) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ad: '', malzeme: 'PLA', renk: 'Siyah', toplam: '1000', fiyat: '500' });
  const malzemeler = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Resin'];

  const ekle = () => {
    if (!form.ad.trim()) { Alert.alert('Hata', 'Stok adı gerekli'); return; }
    const yeni = [...stok, { id: Date.now(), ...form, toplam: +form.toplam, fiyat: +form.fiyat, kullanilan: 0 }];
    setStok(yeni); saveData(KEYS.stok, yeni); setModal(false);
    setForm({ ad: '', malzeme: 'PLA', renk: 'Siyah', toplam: '1000', fiyat: '500' });
  };

  const sil = (id: number) => {
    Alert.alert('Sil', 'Bu stoku silmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => {
        const yeni = stok.filter((s: any) => s.id !== id);
        setStok(yeni); saveData(KEYS.stok, yeni);
      }}
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TouchableOpacity style={[s.btn, { margin: 16 }]} onPress={() => setModal(true)}>
        <Text style={s.btnTxt}>+ Stok Ekle</Text>
      </TouchableOpacity>
      <FlatList data={stok} keyExtractor={i => String(i.id)} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48 }}>🧵</Text>
            <Text style={{ color: C.sub, marginTop: 12 }}>Stok bulunamadı</Text>
            <Text style={{ color: C.border, fontSize: 12, marginTop: 4 }}>Yukarıdan stok ekleyin</Text>
          </View>
        }
        renderItem={({ item }) => {
          const pct = Math.min(100, (item.kullanilan / item.toplam) * 100);
          const kalan = item.toplam - item.kullanilan;
          const renk = pct > 80 ? C.error : pct > 50 ? C.warning : C.success;
          return (
            <View style={[s.card, { marginBottom: 12 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontWeight: 'bold' }}>{item.ad}</Text>
                  <Text style={{ color: C.sub, fontSize: 12 }}>{item.malzeme} • {item.renk} • ₺{item.fiyat}/kg</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ color: renk, fontWeight: 'bold' }}>{kalan}g</Text>
                  <TouchableOpacity onPress={() => sil(item.id)}><Text style={{ color: C.error }}>🗑️</Text></TouchableOpacity>
                </View>
              </View>
              <View style={{ height: 10, backgroundColor: C.border, borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
                <View style={{ width: pct + '%' as any, height: 10, backgroundColor: renk, borderRadius: 5 }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: C.sub, fontSize: 11 }}>Kullanılan: {item.kullanilan}g</Text>
                <Text style={{ color: C.sub, fontSize: 11 }}>Toplam: {item.toplam}g</Text>
                <Text style={{ color: pct > 80 ? C.error : C.sub, fontSize: 11, fontWeight: pct > 80 ? 'bold' : 'normal' }}>{pct.toFixed(0)}%</Text>
              </View>
              {pct > 80 && (
                <View style={{ marginTop: 8, backgroundColor: C.error + '22', borderRadius: 8, padding: 8 }}>
                  <Text style={{ color: C.error, fontSize: 12 }}>⚠️ Stok kritik seviyede! Yenileme zamanı.</Text>
                </View>
              )}
            </View>
          );
        }} />
      <Modal visible={modal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={[s.title, { marginBottom: 16 }]}>🧵 Yeni Stok</Text>
            <TextInput style={[s.inp, { marginBottom: 10 }]} placeholder="Filament Adı *"
              placeholderTextColor={C.sub} value={form.ad} onChangeText={v => setForm(p => ({ ...p, ad: v }))} />
            <Text style={[s.lbl, { marginBottom: 8 }]}>Malzeme</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {malzemeler.map(m => (
                <TouchableOpacity key={m} onPress={() => setForm(p => ({ ...p, malzeme: m }))}
                  style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8,
                    backgroundColor: form.malzeme === m ? C.primary : C.card, borderWidth: 1,
                    borderColor: form.malzeme === m ? C.primary : C.border }}>
                  <Text style={{ color: form.malzeme === m ? '#fff' : C.sub }}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput style={[s.inp, { marginBottom: 10 }]} placeholder="Toplam (gram)"
              placeholderTextColor={C.sub} value={form.toplam} onChangeText={v => setForm(p => ({ ...p, toplam: v }))} keyboardType="decimal-pad" />
            <TextInput style={[s.inp, { marginBottom: 16 }]} placeholder="Fiyat (₺/kg)"
              placeholderTextColor={C.sub} value={form.fiyat} onChangeText={v => setForm(p => ({ ...p, fiyat: v }))} keyboardType="decimal-pad" />
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

// ===== İSTATİSTİK =====
function IstatScreen({ siparisler }: any) {
  const buAy = new Date().getMonth();
  const buYil = new Date().getFullYear();

  const aylik = siparisler.filter((s: any) => {
    try {
      const parcalar = s.tarih.split('.');
      const d = new Date(+parcalar[2], +parcalar[1] - 1, +parcalar[0]);
      return d.getMonth() === buAy && d.getFullYear() === buYil;
    } catch { return false; }
  });

  const toplamGelir = siparisler.reduce((t: number, s: any) => t + (s.satis || 0), 0);
  const toplamKar = siparisler.reduce((t: number, s: any) => t + (s.kar || 0), 0);
  const ayGelir = aylik.reduce((t: number, s: any) => t + (s.satis || 0), 0);
  const ayKar = aylik.reduce((t: number, s: any) => t + (s.kar || 0), 0);
  const bekleyen = siparisler.filter((s: any) => s.durum === 'Bekliyor').length;
  const uretimde = siparisler.filter((s: any) => s.durum === 'Üretimde').length;
  const tamamlanan = siparisler.filter((s: any) => s.durum === 'Tamamlandı').length;
  const ort = siparisler.length > 0 ? toplamGelir / siparisler.length : 0;

  const kartlar = [
    { icon: '📦', lbl: 'Toplam Sipariş', val: String(siparisler.length), color: C.primary },
    { icon: '📅', lbl: 'Bu Ay', val: String(aylik.length), color: C.secondary },
    { icon: '💰', lbl: 'Toplam Gelir', val: '₺' + toplamGelir.toFixed(0), color: C.success },
    { icon: '📈', lbl: 'Bu Ay Gelir', val: '₺' + ayGelir.toFixed(0), color: C.gold },
    { icon: '🏆', lbl: 'Toplam Kâr', val: '₺' + toplamKar.toFixed(0), color: C.warning },
    { icon: '📊', lbl: 'Ortalama', val: '₺' + ort.toFixed(0), color: C.error },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={s.title}>📊 İstatistikler</Text>
      {kartlar.map((k, i) => (
        <View key={i} style={[s.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderLeftWidth: 4, borderLeftColor: k.color }]}>
          <Text style={{ fontSize: 26, marginRight: 14 }}>{k.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.sub, fontSize: 12 }}>{k.lbl}</Text>
            <Text style={{ color: k.color, fontSize: 22, fontWeight: 'bold' }}>{k.val}</Text>
          </View>
        </View>
      ))}

      {siparisler.length > 0 && (
        <>
          <View style={[s.card, { marginTop: 8 }]}>
            <Text style={[s.secTitle, { marginBottom: 14 }]}>SİPARİŞ DURUMLARI</Text>
            {[
              { lbl: '⏳ Bekliyor', val: bekleyen, color: C.warning },
              { lbl: '⚙️ Üretimde', val: uretimde, color: C.primary },
              { lbl: '✅ Tamamlandı', val: tamamlanan, color: C.success },
            ].map(d => (
              <View key={d.lbl} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: C.text, fontSize: 13 }}>{d.lbl}</Text>
                  <Text style={{ color: d.color, fontWeight: 'bold' }}>{d.val}</Text>
                </View>
                <View style={{ height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ width: siparisler.length > 0 ? ((d.val / siparisler.length) * 100) + '%' as any : '0%',
                    height: 6, backgroundColor: d.color, borderRadius: 3 }} />
                </View>
              </View>
            ))}
          </View>

          <View style={[s.card, { marginTop: 12 }]}>
            <Text style={[s.secTitle, { marginBottom: 12 }]}>SON SİPARİŞLER</Text>
            {siparisler.slice(-5).reverse().map((sp: any) => (
              <View key={sp.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: '600' }}>{sp.musteri}</Text>
                  <Text style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>{sp.tarih}</Text>
                </View>
                <Text style={{ color: C.gold, fontWeight: 'bold', fontSize: 15 }}>₺{sp.satis?.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {siparisler.length === 0 && (
        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <Text style={{ fontSize: 60 }}>📊</Text>
          <Text style={{ color: C.sub, marginTop: 12, fontSize: 15 }}>Henüz veri yok</Text>
          <Text style={{ color: C.border, fontSize: 12, marginTop: 4 }}>Hesaplayıcıdan sipariş kaydedin</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ===== ADMIN =====
function AdminScreen({ isPremium, setIsPremium }: any) {
  const [firma, setFirma] = useState('');
  const [bildirim, setBildirim] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData(KEYS.ayarlar, {}).then((a: any) => {
      if (a.firma) setFirma(a.firma);
      if (a.bildirim !== undefined) setBildirim(a.bildirim);
    });
  }, []);

  const kaydet = async () => {
    await saveData(KEYS.ayarlar, { firma, bildirim });
    setSaved(true);
    Alert.alert('✅', 'Ayarlar kaydedildi!');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      <Text style={s.title}>⚙️ Admin Paneli</Text>

      <View style={[s.card, { marginBottom: 12 }]}>
        <Text style={s.secTitle}>ABONELİK</Text>
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          {isPremium ? (
            <>
              <Text style={{ fontSize: 40 }}>⭐</Text>
              <Text style={{ color: C.gold, fontWeight: 'bold', fontSize: 20, marginTop: 8 }}>Premium Aktif</Text>
              <Text style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>Tüm özellikler açık</Text>
            </>
          ) : (
            <>
              <Text style={{ color: C.sub, fontSize: 14, marginBottom: 12 }}>🆓 Ücretsiz Plan • 5 hesap/gün</Text>
              <TouchableOpacity style={[s.btn, { paddingHorizontal: 32 }]}
                onPress={() => Alert.alert('💎 Premium', 'Standard Plan: ₺99/ay\n✅ Sınırsız hesaplama\n✅ WhatsApp paylaşım\n✅ Reklamsız\n\nDealer Plan: ₺199/ay\n✅ Tüm özellikler\n✅ Öncelikli destek\n\nRevenueCat entegrasyonu tamamlanınca aktif olacak.')}>
                <Text style={s.btnTxt}>⭐ Premium'a Geç</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginTop: 12 }}
                onPress={() => { setIsPremium(true); Alert.alert('✅', 'Test modu: Premium aktif edildi!'); }}>
                <Text style={{ color: C.sub, fontSize: 12, textDecorationLine: 'underline' }}>Test: Premium'u aç</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={[s.card, { marginBottom: 12 }]}>
        <Text style={s.secTitle}>GENEL AYARLAR</Text>
        <Text style={s.lbl}>Firma Adı</Text>
        <TextInput style={[s.inp, { marginBottom: 16 }]} value={firma} onChangeText={setFirma}
          placeholder="Firma adınız" placeholderTextColor={C.sub} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}>
          <Text style={{ color: C.text }}>🔔 Bildirimler</Text>
          <Switch value={bildirim} onValueChange={setBildirim}
            trackColor={{ false: C.border, true: C.primary }} thumbColor="#fff" />
        </View>
      </View>

      <TouchableOpacity style={[s.btn, saved && { backgroundColor: C.success }]} onPress={kaydet}>
        <Text style={s.btnTxt}>{saved ? '✅ Kaydedildi!' : '💾 Ayarları Kaydet'}</Text>
      </TouchableOpacity>

      <View style={[s.card, { marginTop: 12 }]}>
        <Text style={s.secTitle}>YASAL</Text>
        {[
          ['📜 Gizlilik Politikası', 'PrintPilot uygulaması kişisel verilerinizi cihazınızda güvenli şekilde saklar. Verileriniz üçüncü taraflarla paylaşılmaz. İletişim: dorlion.ai26@gmail.com'],
          ['📋 Kullanım Şartları', 'PrintPilot uygulamasını kullanarak bu şartları kabul etmiş sayılırsınız. Abonelikler otomatik yenilenir. İptal için App Store/Play Store'u kullanın.'],
          ['✉️ Destek', 'Yardım için: dorlion.ai26@gmail.com\n\nWhatsApp veya e-posta ile ulaşabilirsiniz.'],
        ].map(([lbl, msg]) => (
          <TouchableOpacity key={lbl} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border }}
            onPress={() => Alert.alert(lbl, msg)}>
            <Text style={{ color: C.primary }}>{lbl} →</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ color: C.border, textAlign: 'center', marginTop: 24, fontSize: 11, lineHeight: 18 }}>
        PrintPilot v1.0.0{'
'}by Dorlion AI 🤖{'
'}
        Powered by Claude + Jarvis
      </Text>
    </ScrollView>
  );
}

// ===== ANA UYGULAMA =====
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
  const [onboarding, setOnboarding] = useState<boolean | null>(null);
  const [siparisler, setSiparisler] = useState<any[]>([]);
  const [musteriler, setMusteriler] = useState<any[]>([]);
  const [stok, setStok] = useState<any[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [gunlukCalc, setGunlukCalc] = useState(0);
  const [loading, setLoading] = useState(true);

  // Uygulama açılışında verileri yükle
  useEffect(() => {
    async function init() {
      try {
        const [ob, sp, ms, st, gc] = await Promise.all([
          loadData(KEYS.onboarding, null),
          loadData(KEYS.siparisler, []),
          loadData(KEYS.musteriler, []),
          loadData(KEYS.stok, []),
          loadData(KEYS.gunlukCalc, { count: 0, date: '' }),
        ]);
        setOnboarding(ob);
        setSiparisler(sp);
        setMusteriler(ms);
        setStok(st);
        // Günlük sayaç sıfırla
        if (gc.date !== new Date().toDateString()) {
          setGunlukCalc(0);
        } else {
          setGunlukCalc(gc.count || 0);
        }
      } catch {}
      setLoading(false);
    }
    init();
  }, []);

  const onSave = useCallback((siparis: any) => {
    setSiparisler((prev: any) => {
      const yeni = [siparis, ...prev];
      saveData(KEYS.siparisler, yeni);
      return yeni;
    });
  }, []);

  const onOnboardingDone = () => {
    setOnboarding(true);
    saveData(KEYS.onboarding, true);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <Text style={{ fontSize: 60 }}>🖨️</Text>
        <Text style={{ color: C.primary, fontSize: 22, fontWeight: 'bold', marginTop: 16 }}>PrintPilot</Text>
        <ActivityIndicator color={C.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (!onboarding) {
    return <OnboardingScreen onDone={onOnboardingDone} />;
  }

  const renderScreen = () => {
    switch (tab) {
      case 'hesap': return <HesapScreen onSave={onSave} isPremium={isPremium} gunlukCalc={gunlukCalc} setGunlukCalc={setGunlukCalc} />;
      case 'siparis': return <SiparisScreen siparisler={siparisler} setSiparisler={setSiparisler} />;
      case 'musteri': return <MusteriScreen musteriler={musteriler} setMusteriler={setMusteriler} />;
      case 'stok': return <StokScreen stok={stok} setStok={setStok} />;
      case 'istat': return <IstatScreen siparisler={siparisler} />;
      case 'admin': return <AdminScreen isPremium={isPremium} setIsPremium={setIsPremium} />;
      default: return <HesapScreen onSave={onSave} isPremium={isPremium} gunlukCalc={gunlukCalc} setGunlukCalc={setGunlukCalc} />;
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
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {isPremium && (
            <View style={{ backgroundColor: C.gold + '22', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
              <Text style={{ color: C.gold, fontSize: 11, fontWeight: 'bold' }}>⭐ Premium</Text>
            </View>
          )}
          <View style={{ backgroundColor: C.primary + '22', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
            <Text style={{ color: C.primary, fontSize: 11, fontWeight: 'bold' }}>{siparisler.length} sipariş</Text>
          </View>
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