export interface CalcInput {
  filamentWeight: number;
  filamentCostPerKg: number;
  printTimeHours: number;
  electricityKwh: number;
  printerWatts: number;
  failureRate: number;
  laborHourly: number;
  profitMargin: number;
  commission: number;
  vatRate: number;
  includeVat: boolean;
  extraCosts: number;
}

export interface CalcResult {
  filamentCost: number;
  electricityCost: number;
  laborCost: number;
  failureCost: number;
  extraCost: number;
  totalCost: number;
  priceBeforeVat: number;
  vatAmount: number;
  finalPrice: number;
  profit: number;
  commissionAmount: number;
  // Sentry-Bot: margin analizi eklendi
  marginPercent: number;
  breakEvenWeight: number;
}

// Sentry-Bot önerisi: Güvenli sayı dönüşümü — NaN/Infinity koruması
function safe(n: number): number {
  if (!isFinite(n) || isNaN(n)) return 0;
  return Math.round(n * 100) / 100;
}

// Sentry-Bot önerisi: Input validasyonu
export function validateInput(input: CalcInput): string[] {
  const errors: string[] = [];
  if (input.filamentWeight < 0) errors.push('Filament ağırlığı negatif olamaz');
  if (input.printTimeHours <= 0) errors.push('Baskı süresi sıfırdan büyük olmalı');
  if (input.failureRate < 0 || input.failureRate > 100) errors.push('Fire oranı 0-100 arasında olmalı');
  if (input.profitMargin < 0) errors.push('Kar marjı negatif olamaz');
  if (input.commission < 0 || input.commission > 100) errors.push('Komisyon 0-100 arasında olmalı');
  return errors;
}

export function calculate(input: CalcInput): CalcResult {
  // Sentry-Bot: Tüm girdileri güvenli yap
  const w = Math.max(0, input.filamentWeight);
  const cpk = Math.max(0, input.filamentCostPerKg);
  const hrs = Math.max(0, input.printTimeHours);
  const ekwh = Math.max(0, input.electricityKwh);
  const watts = Math.max(0, input.printerWatts);
  const fail = Math.min(100, Math.max(0, input.failureRate));
  const labor = Math.max(0, input.laborHourly);
  const profit = Math.max(0, input.profitMargin);
  const comm = Math.min(100, Math.max(0, input.commission));
  const vat = Math.min(100, Math.max(0, input.vatRate));

  const filamentCost = (w / 1000) * cpk;
  const electricityCost = (watts / 1000) * hrs * ekwh;
  const laborCost = hrs * labor;
  const baseCost = filamentCost + electricityCost + laborCost + Math.max(0, input.extraCosts);
  
  // Division by zero koruması — Sentry-Bot kritik bulgusu
  const failureCost = baseCost * (fail / 100);
  const totalCost = baseCost + failureCost;
  const priceBeforeVat = totalCost * (1 + profit / 100);
  const commissionAmount = priceBeforeVat * (comm / 100);
  const priceWithComm = priceBeforeVat + commissionAmount;
  const vatAmount = input.includeVat ? priceWithComm * (vat / 100) : 0;
  const finalPrice = priceWithComm + vatAmount;
  const profitAmount = finalPrice - totalCost - commissionAmount - vatAmount;
  
  // Margin analizi
  const marginPercent = finalPrice > 0 ? safe((profitAmount / finalPrice) * 100) : 0;
  
  // Break-even analizi — LevelAI önerisi
  const costPerGram = w > 0 ? safe(totalCost / w) : 0;
  const breakEvenWeight = cpk > 0 ? safe((totalCost * 1000) / cpk) : 0;

  return {
    filamentCost: safe(filamentCost),
    electricityCost: safe(electricityCost),
    laborCost: safe(laborCost),
    failureCost: safe(failureCost),
    extraCost: safe(input.extraCosts),
    totalCost: safe(totalCost),
    priceBeforeVat: safe(priceBeforeVat),
    vatAmount: safe(vatAmount),
    finalPrice: safe(finalPrice),
    profit: safe(profitAmount),
    commissionAmount: safe(commissionAmount),
    marginPercent,
    breakEvenWeight,
  };
}