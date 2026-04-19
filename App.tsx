import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Switch, FlatList, Modal, StatusBar,
  SafeAreaView, Share, Linking, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const C = {
  bg: '#0f0f1a', card: '#1a1a2e', surface: '#16213e',
  primary: '#6C5CE7', secondary: '#00CEC9', gold: '#F9CA24',
  success: '#00B894', error: '#E17055', warning: '#FDCB6E',
  text: '#FFFFFF', sub: '#A0A0B0', border: '#2D2D4E',
};

const KEYS = {
  siparisler: 'pp_siparisler', musteriler: 'pp_musteriler',
  stok: 'pp_stok', ayarlar: 'pp_ayarlar',
  onboarding: 'pp_onboarding', gunlukCalc: 'pp_gunluk_calc',
};

async function loadData(key: string, fallback: any) {
  try { const v = await AsyncStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
async function saveData(key: string, data: any) {
  try { await AsyncStorage.setItem(key, JSON.stringify(data)); } catch {}
}

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

function OnboardingScreen({ onDone }: any) {
  const [step, setStep] = useState(0);
  const slides = [
    { icon: '🖨️', title: 'PrintPilot Hoş Geldin!', desc: '3D baskı işletmeni için tüm yönetim tek ekranda. Maliyet hesapla, sipariş takip et, müşteri yönet.' },
    { icon: '💰', title: 'Doğru Fiyat, Daha Fazla Kar', desc: 'Filament, elektrik, işçilik, fire ve KDV dahil gerçek maliyet hesabı. Artık zarar etme!' },
    { icon: '📋', title: 'Siparişleri Takip Et', desc: 'Her siparişi kaydet, WhatsApp ile müşteriye gönder, durumunu takip et.' },
    { icon: '📦', title: 'Stok Kontrolü', desc: 'Filament stoğunu takip et, kritik seviyede uyarı al. Asla malzeme bitmeden sürprizle karşılaşma.' },
  ];
  const s = slides[step];
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <Text style={{ fontSize: 80, marginBottom: 24 }}>{s.icon}</Text>
      <Text style={{ color: C.text, fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>{s.title}</Text>
      <Text style={{ color: C.sub, fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 40 }}>{s.desc}</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 40 }}>
        {slides.map((_, i) => (
          <View key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i === step ? C.primary : C.border }} />
        ))}
      </View>
      <TouchableOpacity style={{ backgroundColor: C.primary, borderRadius: 14, paddingHorizontal: 40, paddingVertical: 16, width: '100%', alignItems: 'center' }}
        onPress={() => step < slides.length - 1 ? setStep(step + 1) : onDone()}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>{step < slides.length - 1 ? 'Devam →' : 'Basla!'}</Text>
      </TouchableOpacity>
      {step > 0 && (
        <TouchableOpacity style={{ marginTop: 16 }} onPress={onDone}>
          <Text style={{ color: C.sub, fontSize: 14 }}>Atla</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function HesapScreen({ onSave, isPremium, gunlukCalc, setGunlukCalc }: any) {
  const [form, setForm] = useState({
    fw: '50', cpk: '500', hrs: '3', ekwh: '2.5', watts: '200',
    fail: '10', labor: '50', profit: '30', comm: '0', extra: '0',
    vat: false, vatR: '20', musteri: '', aciklama: ''
  });
  const [result, setResult] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [sharing, setSharing] = useState(false);
  const LIMIT = 5;
  const gunKalan = Math.max(0, LIMIT - gunlukCalc);
  const upd = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const calc = () => {
    if (!isPremium && gunlukCalc >= LIMIT) {
      Alert.alert('Limit Doldu', 'Gunluk 5 hesaplama hakkini kullandiniz. Premium ile sinırsız hesaplayin!');
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
    onSave({
      id: Date.now(), musteri: form.musteri || 'Genel', aciklama: form.aciklama,
      filamentGr: +form.fw, sure: +form.hrs, maliyet: result.maliyet,
      satis: result.satis, kar: result.kar,
      tarih: new Date().toLocaleDateString('tr-TR'), durum: 'Bekliyor', detay: form
    });
    setSaved(true);
    Alert.alert('Kaydedildi!', 'Siparis gecmisine eklendi.');
  };

  const whatsapp = async () => {
    if (!result) return;
    setSharing(true);
    const msg = 'PrintPilot - Fiyat Teklifi' +
      '
Musteri: ' + (form.musteri || 'Genel') +
      '
Aciklama: ' + (form.aciklama || '-') +
      '
Filament: ' + form.fw + 'g' +
      '
Sure: ' + form.hrs + ' saat' +
      '
Maliyet: ' + result.maliyet.toFixed(2) + ' TL' +
      '
Satis Fiyati: ' + result.satis.toFixed(2) + ' TL' +
      '
Kar: ' + result.kar.toFixed(2) + ' TL' +
      '

PrintPilot ile hesaplandi';
    try {
      const url = 'whatsapp://send?text=' + encodeURIComponent(msg);
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
      else await Share.share({ message: msg });
    } catch { Alert.alert('Hata', 'Paylasim acilamadi'); }
    setSharing(false);
  };

  const Field = ({ lbl, k, decimal = true }: any) => (
    <View style={st.field}>
      <Text style={st.lbl}>{lbl}</Text>
      <TextInput style={st.inp} value={(form as any)[k]}
        onChangeText={v => upd(k, v)} keyboardType={decimal ? 'decimal-pad' : 'default'}
        placeholderTextColor={C.sub} />
    </View>
  );

  const Row = ({ lbl, val, bold, hi }: any) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
      <Text style={{ color: hi ? C.gold : bold ? C.text : C.sub, fontWeight: bold ? 'bold' : 'normal', fontSize: bold ? 15 : 13 }}>{lbl}</Text>
      <Text style={{ color: hi ? C.gold : bold ? C.text : C.sub, fontWeight: bold ? 'bold' : 'normal', fontSize: bold ? 15 : 13 }}>
        TL{val?.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={st.title}>Fiyat Hesaplayici</Text>
        {!isPremium && (
          <View style={{ backgroundColor: gunKalan <= 1 ? C.error + '33' : C.primary + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
            <Text style={{ color: gunKalan <= 1 ? C.error : C.primary, fontSize: 12, fontWeight: 'bold' }}>{gunKalan}/{LIMIT} hak</Text>
          </View>
        )}
      </View>
      <View style={st.card}>
        <Text style={st.secTit}>SIPARIS BILGISI</Text>
        <TextInput style={[st.inp, { marginBottom: 10 }]} placeholder="Musteri adi (opsiyonel)"
          placeholderTextColor={C.sub} value={form.musteri} onChangeText={v => upd('musteri', v)} />
        <TextInput style={st.inp} placeholder="Aciklama (opsiyonel)"
          placeholderTextColor={C.sub} value={form.aciklama} onChangeText={v => upd('aciklama', v)} />
      </View>
      <View style={[st.card, { marginTop: 12 }]}>
        <Text style={st.secTit}>MALZEME & BASKI</Text>
        <Field lbl="Filament (gram)" k="fw" />
        <Field lbl="Filament Fiyati (TL/kg)" k="cpk" />
        <Field lbl="Baski Suresi (saat)" k="hrs" />
        <Field lbl="Yazici Gucu (Watt)" k="watts" />
        <Field lbl="Elektrik (TL/kWh)" k="ekwh" />
      </View>
      <View style={[st.card, { marginTop: 12 }]}>
        <Text style={st.secTit}>MALIYET & KAR</Text>
        <Field lbl="Iscilik (TL/saat)" k="labor" />
        <Field lbl="Fire Orani (%)" k="fail" />
        <Field lbl="Kar Marji (%)" k="profit" />
        <Field lbl="Komisyon (%)" k="comm" />
        <Field lbl="Ekstra Maliyet (TL)" k="extra" />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Text style={st.lbl}>KDV Dahil Et</Text>
          <Switch value={form.vat} onValueChange={v => upd('vat', v)}
            trackColor={{ false: C.border, true: C.primary }} thumbColor="#fff" />
        </View>
      </View>
      <TouchableOpacity style={[st.btn, { marginTop: 16 }]} onPress={calc}>
        <Text style={st.btnTxt}>{!isPremium && gunlukCalc >= LIMIT ? 'Premium ile Hesapla' : 'Hesapla'}</Text>
      </TouchableOpacity>
      {result && (
        <View style={[st.card, { marginTop: 16 }]}>
          <Text style={[st.title, { fontSize: 16, marginBottom: 14 }]}>Sonuc</Text>
          <Row lbl="Filament" val={result.filament} />
          <Row lbl="Elektrik" val={result.elektrik} />
          <Row lbl="Iscilik" val={result.iscilik} />
          <Row lbl="Fire" val={result.fire} />
          <View style={{ height: 1, backgroundColor: C.border, marginVertical: 10 }} />
          <Row lbl="Toplam Maliyet" val={result.maliyet} bold />
          {result.kdv > 0 && <Row lbl="KDV" val={result.kdv} />}
          <Row lbl="SATIS FIYATI" val={result.satis} bold hi />
          <Row lbl={"Kar (%" + result.margin + ")"} val={result.kar} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <TouchableOpacity style={[st.btn, { flex: 1, backgroundColor: saved ? C.success : C.primary }]} onPress={kaydet}>
              <Text style={st.btnTxt}>{saved ? 'Kaydedildi!' : 'Kaydet'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[st.btn, { flex: 1, backgroundColor: '#25D366' }]} onPress={whatsapp} disabled={sharing}>
              {sharing ? <ActivityIndicator color="#fff" size="small" /> : <Text style={st.btnTxt}>WhatsApp</Text>}
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[st.btn, { marginTop: 8, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }]}
            onPress={() => Share.share({ message: 'PrintPilot\nMaliyet: TL' + result.maliyet.toFixed(2) + '\nSatis: TL' + result.satis.toFixed(2) })}>
            <Text style={[st.btnTxt, { color: C.text }]}>Diger Uygulama ile Paylas</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function SiparisScreen({ siparisler, setSiparisler }: any) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tumü');
  const durumlar = ['Tumü', 'Bekliyor', 'Üretimde', 'Tamamlandi'];
  const filtered = siparisler.filter((x: any) => {
    const sOk = x.musteri.toLowerCase().includes(search.toLowerCase());
    const fOk = filter === 'Tumü' || x.durum === filter;
    return sOk && fOk;
  });
  const durumRenk: any = { 'Bekliyor': C.warning, 'Üretimde': C.primary, 'Tamamlandi': C.success };

  const durumDegistir = (id: number, yeniDurum: string) => {
    const yeni = siparisler.map((s: any) => s.id === id ? { ...s, durum: yeniDurum } : s);
    setSiparisler(yeni); saveData(KEYS.siparisler, yeni);
  };

  const sil = (id: number) => Alert.alert('Sil', 'Bu siparisi silmek istiyor musunuz?', [
    { text: 'Iptal', style: 'cancel' },
    { text: 'Sil', style: 'destructive', onPress: () => {
      const yeni = siparisler.filter((s: any) => s.id !== id);
      setSiparisler(yeni); saveData(KEYS.siparisler, yeni);
    }}
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <TextInput style={st.inp} placeholder="Siparis ara..." placeholderTextColor={C.sub} value={search} onChangeText={setSearch} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {durumlar.map(d => (
            <TouchableOpacity key={d} onPress={() => setFilter(d)}
              style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8,
                backgroundColor: filter === d ? C.primary : C.card, borderWidth: 1, borderColor: filter === d ? C.primary : C.border }}>
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
            <Text style={{ color: C.sub, marginTop: 12 }}>Siparis bulunamadi</Text>
            <Text style={{ color: C.border, fontSize: 12, marginTop: 4 }}>Hesaplayicidan siparis kaydedin</Text>
          </View>
        }
        renderItem={({ item }: any) => (
          <View style={[st.card, { marginBottom: 12 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: 'bold', fontSize: 15 }}>{item.musteri}</Text>
                {item.aciklama ? <Text style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>{item.aciklama}</Text> : null}
                <Text style={{ color: C.border, fontSize: 11, marginTop: 2 }}>{item.tarih} • {item.filamentGr}g • {item.sure}s</Text>
              </View>
              <View style={{ backgroundColor: (durumRenk[item.durum] || C.sub) + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                <Text style={{ color: durumRenk[item.durum] || C.sub, fontSize: 11, fontWeight: 'bold' }}>{item.durum}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.surface, borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: C.sub, fontSize: 10 }}>Maliyet</Text>
                <Text style={{ color: C.text, fontWeight: 'bold' }}>TL{item.maliyet?.toFixed(2)}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: C.sub, fontSize: 10 }}>Satis</Text>
                <Text style={{ color: C.gold, fontWeight: 'bold', fontSize: 17 }}>TL{item.satis?.toFixed(2)}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: C.sub, fontSize: 10 }}>Kar</Text>
                <Text style={{ color: C.success, fontWeight: 'bold' }}>TL{item.kar?.toFixed(2)}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {['Bekliyor', 'Üretimde', 'Tamamlandi'].map(d => (
                <TouchableOpacity key={d} onPress={() => durumDegistir(item.id, d)}
                  style={{ flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center',
                    backgroundColor: item.durum === d ? (durumRenk[d] + '33') : C.surface,
                    borderWidth: 1, borderColor: item.durum === d ? durumRenk[d] : C.border }}>
                  <Text style={{ color: item.durum === d ? durumRenk[d] : C.sub, fontSize: 10, fontWeight: 'bold' }}>{d}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => sil(item.id)}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: C.error + '22', borderWidth: 1, borderColor: C.error + '55', justifyContent: 'center' }}>
                <Text style={{ color: C.error }}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

function MusteriScreen({ musteriler, setMusteriler }: any) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ad: '', tel: '', mail: '' });
  const [search, setSearch] = useState('');
  const filtered = musteriler.filter((x: any) => x.ad.toLowerCase().includes(search.toLowerCase()));

  const ekle = () => {
    if (!form.ad.trim()) { Alert.alert('Hata', 'Isim gerekli'); return; }
    const yeni = [...musteriler, { id: Date.now(), ...form, tarih: new Date().toLocaleDateString('tr-TR') }];
    setMusteriler(yeni); saveData(KEYS.musteriler, yeni);
    setForm({ ad: '', tel: '', mail: '' }); setModal(false);
  };

  const sil = (id: number) => Alert.alert('Sil', 'Bu musteri silinsin mi?', [
    { text: 'Iptal', style: 'cancel' },
    { text: 'Sil', style: 'destructive', onPress: () => {
      const yeni = musteriler.filter((m: any) => m.id !== id);
      setMusteriler(yeni); saveData(KEYS.musteriler, yeni);
    }}
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, flexDirection: 'row', gap: 10 }}>
        <TextInput style={[st.inp, { flex: 1 }]} placeholder="Musteri ara..."
          placeholderTextColor={C.sub} value={search} onChangeText={setSearch} />
        <TouchableOpacity style={[st.btn, { paddingHorizontal: 20 }]} onPress={() => setModal(true)}>
          <Text style={st.btnTxt}>+ Ekle</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={filtered} keyExtractor={i => String(i.id)} contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={<View style={{ alignItems: 'center', marginTop: 60 }}><Text style={{ fontSize: 48 }}>👥</Text><Text style={{ color: C.sub, marginTop: 12 }}>Musteri yok</Text></View>}
        renderItem={({ item }) => (
          <View style={[st.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 10 }]}>
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{item.ad[0].toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: 'bold' }}>{item.ad}</Text>
              {item.tel ? <Text style={{ color: C.sub, fontSize: 12 }}>{item.tel}</Text> : null}
              {item.mail ? <Text style={{ color: C.sub, fontSize: 12 }}>{item.mail}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => sil(item.id)}>
              <Text style={{ color: C.error, fontSize: 18 }}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Modal visible={modal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={[st.title, { marginBottom: 16 }]}>Yeni Musteri</Text>
            {[['ad','Isim *'],['tel','Telefon'],['mail','E-posta']].map(([k,ph]) => (
              <TextInput key={k} style={[st.inp, { marginBottom: 10 }]} placeholder={ph} placeholderTextColor={C.sub}
                value={(form as any)[k]} onChangeText={v => setForm((p: any) => ({ ...p, [k]: v }))} />
            ))}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
              <TouchableOpacity style={[st.btn, { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }]} onPress={() => setModal(false)}>
                <Text style={[st.btnTxt, { color: C.text }]}>Iptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[st.btn, { flex: 1 }]} onPress={ekle}>
                <Text style={st.btnTxt}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StokScreen({ stok, setStok }: any) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ad: '', malzeme: 'PLA', toplam: '1000', fiyat: '500' });
  const malzemeler = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Resin'];

  const ekle = () => {
    if (!form.ad.trim()) { Alert.alert('Hata', 'Ad gerekli'); return; }
    const yeni = [...stok, { id: Date.now(), ...form, toplam: +form.toplam, fiyat: +form.fiyat, kullanilan: 0 }];
    setStok(yeni); saveData(KEYS.stok, yeni);
    setForm({ ad: '', malzeme: 'PLA', toplam: '1000', fiyat: '500' }); setModal(false);
  };

  const sil = (id: number) => Alert.alert('Sil', 'Bu stok silinsin mi?', [
    { text: 'Iptal', style: 'cancel' },
    { text: 'Sil', style: 'destructive', onPress: () => {
      const yeni = stok.filter((s: any) => s.id !== id);
      setStok(yeni); saveData(KEYS.stok, yeni);
    }}
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TouchableOpacity style={[st.btn, { margin: 16 }]} onPress={() => setModal(true)}>
        <Text style={st.btnTxt}>+ Stok Ekle</Text>
      </TouchableOpacity>
      <FlatList data={stok} keyExtractor={i => String(i.id)} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={<View style={{ alignItems: 'center', marginTop: 60 }}><Text style={{ fontSize: 48 }}>🧵</Text><Text style={{ color: C.sub, marginTop: 12 }}>Stok yok</Text></View>}
        renderItem={({ item }) => {
          const pct = Math.min(100, (item.kullanilan / item.toplam) * 100);
          const kalan = item.toplam - item.kullanilan;
          const renk = pct > 80 ? C.error : pct > 50 ? C.warning : C.success;
          return (
            <View style={[st.card, { marginBottom: 12 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontWeight: 'bold' }}>{item.ad}</Text>
                  <Text style={{ color: C.sub, fontSize: 12 }}>{item.malzeme} • TL{item.fiyat}/kg</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ color: renk, fontWeight: 'bold' }}>{kalan}g</Text>
                  <TouchableOpacity onPress={() => sil(item.id)}><Text style={{ color: C.error }}>×</Text></TouchableOpacity>
                </View>
              </View>
              <View style={{ height: 10, backgroundColor: C.border, borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
                <View style={{ width: pct + '%' as any, height: 10, backgroundColor: renk, borderRadius: 5 }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: C.sub, fontSize: 11 }}>Kullanilan: {item.kullanilan}g</Text>
                <Text style={{ color: C.sub, fontSize: 11 }}>Toplam: {item.toplam}g</Text>
                <Text style={{ color: renk, fontSize: 11, fontWeight: pct > 80 ? 'bold' : 'normal' }}>{pct.toFixed(0)}%</Text>
              </View>
              {pct > 80 && (
                <View style={{ marginTop: 8, backgroundColor: C.error + '22', borderRadius: 8, padding: 8 }}>
                  <Text style={{ color: C.error, fontSize: 12 }}>Stok kritik! Yenileme zamani.</Text>
                </View>
              )}
            </View>
          );
        }}
      />
      <Modal visible={modal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={[st.title, { marginBottom: 16 }]}>Yeni Stok</Text>
            <TextInput style={[st.inp, { marginBottom: 10 }]} placeholder="Filament Adi *"
              placeholderTextColor={C.sub} value={form.ad} onChangeText={v => setForm(p => ({ ...p, ad: v }))} />
            <Text style={[st.lbl, { marginBottom: 8 }]}>Malzeme</Text>
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
            <TextInput style={[st.inp, { marginBottom: 10 }]} placeholder="Toplam (gram)"
              placeholderTextColor={C.sub} value={form.toplam} onChangeText={v => setForm(p => ({ ...p, toplam: v }))} keyboardType="decimal-pad" />
            <TextInput style={[st.inp, { marginBottom: 16 }]} placeholder="Fiyat (TL/kg)"
              placeholderTextColor={C.sub} value={form.fiyat} onChangeText={v => setForm(p => ({ ...p, fiyat: v }))} keyboardType="decimal-pad" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[st.btn, { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }]} onPress={() => setModal(false)}>
                <Text style={[st.btnTxt, { color: C.text }]}>Iptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[st.btn, { flex: 1 }]} onPress={ekle}>
                <Text style={st.btnTxt}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function IstatScreen({ siparisler }: any) {
  const buAy = new Date().getMonth();
  const buYil = new Date().getFullYear();
  const aylik = siparisler.filter((s: any) => {
    try {
      const p = s.tarih.split('.'); const d = new Date(+p[2], +p[1]-1, +p[0]);
      return d.getMonth() === buAy && d.getFullYear() === buYil;
    } catch { return false; }
  });
  const topGelir = siparisler.reduce((t: number, s: any) => t + (s.satis || 0), 0);
  const topKar = siparisler.reduce((t: number, s: any) => t + (s.kar || 0), 0);
  const ayGelir = aylik.reduce((t: number, s: any) => t + (s.satis || 0), 0);
  const ort = siparisler.length > 0 ? topGelir / siparisler.length : 0;
  const bekleyen = siparisler.filter((s: any) => s.durum === 'Bekliyor').length;
  const uretimde = siparisler.filter((s: any) => s.durum === 'Üretimde').length;
  const tamamlandi = siparisler.filter((s: any) => s.durum === 'Tamamlandi').length;

  const kartlar = [
    { icon: '📦', lbl: 'Toplam Siparis', val: String(siparisler.length), color: C.primary },
    { icon: '📅', lbl: 'Bu Ay', val: String(aylik.length), color: C.secondary },
    { icon: '💰', lbl: 'Toplam Gelir', val: 'TL' + topGelir.toFixed(0), color: C.success },
    { icon: '📈', lbl: 'Bu Ay Gelir', val: 'TL' + ayGelir.toFixed(0), color: C.gold },
    { icon: '🏆', lbl: 'Toplam Kar', val: 'TL' + topKar.toFixed(0), color: C.warning },
    { icon: '📊', lbl: 'Ortalama', val: 'TL' + ort.toFixed(0), color: C.error },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={st.title}>Istatistikler</Text>
      {kartlar.map((k, i) => (
        <View key={i} style={[st.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderLeftWidth: 4, borderLeftColor: k.color }]}>
          <Text style={{ fontSize: 26, marginRight: 14 }}>{k.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.sub, fontSize: 12 }}>{k.lbl}</Text>
            <Text style={{ color: k.color, fontSize: 22, fontWeight: 'bold' }}>{k.val}</Text>
          </View>
        </View>
      ))}
      {siparisler.length > 0 && (
        <>
          <View style={[st.card, { marginTop: 8 }]}>
            <Text style={[st.secTit, { marginBottom: 14 }]}>SIPARIS DURUMLARI</Text>
            {[
              { lbl: 'Bekliyor', val: bekleyen, color: C.warning },
              { lbl: 'Üretimde', val: uretimde, color: C.primary },
              { lbl: 'Tamamlandi', val: tamamlandi, color: C.success },
            ].map(d => (
              <View key={d.lbl} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: C.text, fontSize: 13 }}>{d.lbl}</Text>
                  <Text style={{ color: d.color, fontWeight: 'bold' }}>{d.val}</Text>
                </View>
                <View style={{ height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ width: siparisler.length > 0 ? ((d.val / siparisler.length) * 100) + '%' as any : '0%', height: 6, backgroundColor: d.color, borderRadius: 3 }} />
                </View>
              </View>
            ))}
          </View>
          <View style={[st.card, { marginTop: 12 }]}>
            <Text style={[st.secTit, { marginBottom: 12 }]}>SON SIPARISLER</Text>
            {siparisler.slice(-5).reverse().map((sp: any) => (
              <View key={sp.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: '600' }}>{sp.musteri}</Text>
                  <Text style={{ color: C.sub, fontSize: 11 }}>{sp.tarih}</Text>
                </View>
                <Text style={{ color: C.gold, fontWeight: 'bold', fontSize: 15 }}>TL{sp.satis?.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </>
      )}
      {siparisler.length === 0 && (
        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <Text style={{ fontSize: 60 }}>📊</Text>
          <Text style={{ color: C.sub, marginTop: 12 }}>Henüz veri yok</Text>
          <Text style={{ color: C.border, fontSize: 12, marginTop: 4 }}>Hesaplayicidan siparis kaydedin</Text>
        </View>
      )}
    </ScrollView>
  );
}

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
    Alert.alert('Kaydedildi!', 'Ayarlar kaydedildi.');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      <Text style={st.title}>Admin Paneli</Text>
      <View style={[st.card, { marginBottom: 12 }]}>
        <Text style={st.secTit}>ABONELIK</Text>
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          {isPremium ? (
            <>
              <Text style={{ fontSize: 40 }}>⭐</Text>
              <Text style={{ color: C.gold, fontWeight: 'bold', fontSize: 20, marginTop: 8 }}>Premium Aktif</Text>
            </>
          ) : (
            <>
              <Text style={{ color: C.sub, fontSize: 14, marginBottom: 12 }}>Ucretsiz Plan - 5 hesap/gun</Text>
              <TouchableOpacity style={[st.btn, { paddingHorizontal: 32 }]}
                onPress={() => Alert.alert('Premium', 'Standard: TL99/ay - Sinırsız hesaplama, WhatsApp paylasim

Dealer: TL199/ay - Tum ozellikler

Yakinda aktif!')}>
                <Text style={st.btnTxt}>Premium Ol</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginTop: 12 }} onPress={() => { setIsPremium(true); Alert.alert('Test', 'Premium test modu acildi!'); }}>
                <Text style={{ color: C.sub, fontSize: 12, textDecorationLine: 'underline' }}>Test: Premium ac</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      <View style={[st.card, { marginBottom: 12 }]}>
        <Text style={st.secTit}>AYARLAR</Text>
        <Text style={st.lbl}>Firma Adi</Text>
        <TextInput style={[st.inp, { marginBottom: 16 }]} value={firma} onChangeText={setFirma}
          placeholder="Firma adiniz" placeholderTextColor={C.sub} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}>
          <Text style={{ color: C.text }}>Bildirimler</Text>
          <Switch value={bildirim} onValueChange={setBildirim} trackColor={{ false: C.border, true: C.primary }} thumbColor="#fff" />
        </View>
      </View>
      <TouchableOpacity style={[st.btn, saved && { backgroundColor: C.success }]} onPress={kaydet}>
        <Text style={st.btnTxt}>{saved ? 'Kaydedildi!' : 'Kaydet'}</Text>
      </TouchableOpacity>
      <View style={[st.card, { marginTop: 12 }]}>
        <Text style={st.secTit}>YASAL</Text>
        {[
          ['Gizlilik Politikasi', 'PrintPilot uygulamasi verilerinizi cihazinizda saklar. Ucuncu taraflarla paylasilmaz. İletisim: dorlion.ai26@gmail.com'],
          ['Kullanim Sartlari', 'Abonelikler otomatik yenilenir. Iptal icin App Store/Play Store kullanin.'],
          ['Destek', 'E-posta: dorlion.ai26@gmail.com'],
        ].map(([lbl, msg]) => (
          <TouchableOpacity key={lbl} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border }}
            onPress={() => Alert.alert(lbl, msg)}>
            <Text style={{ color: C.primary }}>{lbl} →</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{ color: C.border, textAlign: 'center', marginTop: 24, fontSize: 11, lineHeight: 18 }}>
        PrintPilot v1.0.0 by Dorlion AI
      </Text>
    </ScrollView>
  );
}

const TABS = [
  { k: 'hesap', lbl: 'Hesap', ico: '🧮' },
  { k: 'siparis', lbl: 'Siparisler', ico: '📋' },
  { k: 'musteri', lbl: 'Musteri', ico: '👥' },
  { k: 'stok', lbl: 'Stok', ico: '🧵' },
  { k: 'istat', lbl: 'Istatistik', ico: '📊' },
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

  useEffect(() => {
    async function init() {
      try {
        const [ob, sp, ms, st2, gc] = await Promise.all([
          loadData(KEYS.onboarding, null),
          loadData(KEYS.siparisler, []),
          loadData(KEYS.musteriler, []),
          loadData(KEYS.stok, []),
          loadData(KEYS.gunlukCalc, { count: 0, date: '' }),
        ]);
        setOnboarding(ob);
        setSiparisler(sp);
        setMusteriler(ms);
        setStok(st2);
        if (gc.date !== new Date().toDateString()) setGunlukCalc(0);
        else setGunlukCalc(gc.count || 0);
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

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <Text style={{ fontSize: 60 }}>🖨️</Text>
      <Text style={{ color: C.primary, fontSize: 22, fontWeight: 'bold', marginTop: 16 }}>PrintPilot</Text>
      <ActivityIndicator color={C.primary} style={{ marginTop: 24 }} />
    </View>
  );

  if (!onboarding) return (
    <OnboardingScreen onDone={() => { setOnboarding(true); saveData(KEYS.onboarding, true); }} />
  );

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
          <Text style={{ color: C.primary, fontSize: 20, fontWeight: 'bold' }}>PrintPilot</Text>
          <Text style={{ color: C.sub, fontSize: 10 }}>3D Baski Yonetim Merkezi</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {isPremium && <View style={{ backgroundColor: C.gold + '22', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}><Text style={{ color: C.gold, fontSize: 11, fontWeight: 'bold' }}>Premium</Text></View>}
          <View style={{ backgroundColor: C.primary + '22', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
            <Text style={{ color: C.primary, fontSize: 11, fontWeight: 'bold' }}>{siparisler.length} siparis</Text>
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

const st = StyleSheet.create({
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#2D2D4E' },
  field: { marginBottom: 12 },
  lbl: { color: '#A0A0B0', fontSize: 12, marginBottom: 4 },
  inp: { backgroundColor: '#16213e', color: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#2D2D4E', fontSize: 14 },
  btn: { backgroundColor: '#6C5CE7', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  secTit: { color: '#A0A0B0', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 12 },
});