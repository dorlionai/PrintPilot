import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getSetting } from './database';

export interface QuoteData {
  orderNo: string;
  customerName: string;
  items: Array<{ label: string; value: string }>;
  totalCost: number;
  salePrice: number;
  notes?: string;
  date: string;
}

export async function generateAndShareQuote(data: QuoteData): Promise<void> {
  const companyName = getSetting('company_name') || 'PrintPilot';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #6C5CE7; padding-bottom: 20px; margin-bottom: 30px; }
    .company { font-size: 24px; font-weight: bold; color: #6C5CE7; }
    .title { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 20px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .label { color: #666; }
    .value { font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #6C5CE7; color: white; padding: 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #eee; }
    .total-row { background: #f8f8f8; font-weight: bold; }
    .sale-price { color: #6C5CE7; font-size: 20px; font-weight: bold; text-align: right; margin-top: 20px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; text-align: center; }
    .badge { background: #6C5CE7; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">${companyName}</div>
    <div class="badge">TEKLİF</div>
  </div>
  <div class="title">Teklif #${data.orderNo}</div>
  <div class="info-row"><span class="label">Tarih:</span><span class="value">${data.date}</span></div>
  <div class="info-row"><span class="label">Müşteri:</span><span class="value">${data.customerName}</span></div>
  <table>
    <tr><th>Maliyet Kalemi</th><th>Tutar</th></tr>
    ${data.items.map(i => `<tr><td>${i.label}</td><td>${i.value}</td></tr>`).join('')}
    <tr class="total-row"><td>Toplam Maliyet</td><td>₺${data.totalCost.toFixed(2)}</td></tr>
  </table>
  ${data.notes ? `<p><strong>Notlar:</strong> ${data.notes}</p>` : ''}
  <div class="sale-price">SATIŞ FİYATI: ₺${data.salePrice.toFixed(2)}</div>
  <div class="footer">Bu teklif ${companyName} tarafından PrintPilot uygulaması ile oluşturulmuştur.</div>
</body>
</html>`;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Teklifi Paylaş' });
  }
}