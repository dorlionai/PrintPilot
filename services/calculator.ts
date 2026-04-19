export interface CalcInput {
  filamentWeight: number;   // gram
  filamentCostPerKg: number; // ₺
  printTimeHours: number;
  electricityKwh: number;   // ₺/kWh
  printerWatts: number;     // W
  failureRate: number;       // %
  laborHourly: number;       // ₺/saat
  profitMargin: number;      // %
  commission: number;        // %
  vatRate: number;           // %
  includeVat: boolean;
  extraCosts: number;        // ₺
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
}

export function calculate(input: CalcInput): CalcResult {
  const filamentCost = (input.filamentWeight / 1000) * input.filamentCostPerKg;
  const electricityCost = (input.printerWatts / 1000) * input.printTimeHours * input.electricityKwh;
  const laborCost = input.printTimeHours * input.laborHourly;
  const baseCost = filamentCost + electricityCost + laborCost + input.extraCosts;
  const failureCost = baseCost * (input.failureRate / 100);
  const totalCost = baseCost + failureCost;
  const priceBeforeVat = totalCost * (1 + input.profitMargin / 100);
  const commissionAmount = priceBeforeVat * (input.commission / 100);
  const priceWithCommission = priceBeforeVat + commissionAmount;
  const vatAmount = input.includeVat ? priceWithCommission * (input.vatRate / 100) : 0;
  const finalPrice = priceWithCommission + vatAmount;
  const profit = finalPrice - totalCost - commissionAmount - vatAmount;

  return {
    filamentCost: Math.round(filamentCost * 100) / 100,
    electricityCost: Math.round(electricityCost * 100) / 100,
    laborCost: Math.round(laborCost * 100) / 100,
    failureCost: Math.round(failureCost * 100) / 100,
    extraCost: input.extraCosts,
    totalCost: Math.round(totalCost * 100) / 100,
    priceBeforeVat: Math.round(priceBeforeVat * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    commissionAmount: Math.round(commissionAmount * 100) / 100,
  };
}