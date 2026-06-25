export type FuelType = 'gasoline' | 'jet a' | 'diesel';
export type WgtVolUnit = 'gal' | 'lb' | 'l' | 'kg';

const round = (value: number, decimals: number): number => {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
};

// 1. API Correction
export const calculateCorrectedApi = (fuelType: FuelType, apiString: string, tempString: string): number | null => {
  const api = parseFloat(apiString);
  const temp = parseFloat(tempString);

  if (isNaN(api) || isNaN(temp)) return null;
  if (temp < -50 || temp > 150 || api < 10 || api > 100) return null;

  const dt = round(temp - 60, 1);
  const rho_obs = round((141.5 / (api + 131.5)) * 999.016, 1);

  let coeff_0 = 0, coeff_1 = 0;
  if (fuelType === 'gasoline') { coeff_0 = 192.4571; coeff_1 = 0.2438; }
  else if (fuelType === 'jet a') { coeff_0 = 330.301; coeff_1 = 0; }
  else if (fuelType === 'diesel') { coeff_0 = 103.872; coeff_1 = 0.2701; }

  const calcAlpha = (rho: number) => round((coeff_0 / (rho * rho)) + (coeff_1 / rho), 9);
  const calcCtl = (alpha: number) => Math.exp(-alpha * dt * (1 + 0.8 * alpha * dt));

  const alpha_guess = calcAlpha(rho_obs);
  const ctl_guess = calcCtl(alpha_guess);
  
  const rho_1 = round(rho_obs / ctl_guess, 1);
  const alpha_1 = calcAlpha(rho_1);
  const ctl_1 = calcCtl(alpha_1);

  const rho_2 = round(rho_obs / ctl_1, 1);
  const alpha_2 = calcAlpha(rho_2);
  const ctl_2 = calcCtl(alpha_2);

  const rho_3 = round(rho_obs / ctl_2, 1);
  return round((141.5 / (rho_3 / 999.016)) - 131.5, 1);
};

// 2. Gross to Net Volume (VCF)
export const calculateGrossNet = (fuelType: FuelType, corrApiStr: string, obsTempStr: string, grossVolStr: string) => {
  const corrApi = parseFloat(corrApiStr);
  const obsTemp = parseFloat(obsTempStr);
  const grossVol = parseFloat(grossVolStr);

  if (isNaN(corrApi) || isNaN(obsTemp) || isNaN(grossVol)) return null;
  if (obsTemp < -50 || obsTemp > 150 || corrApi < 10 || corrApi > 100) return null;

  const rho_60 = round(141.5 / (corrApi + 131.5) * 999.016, 1);
  const delta_t = round(obsTemp - 60, 1);

  let coeff_0 = 0, coeff_1 = 0;
  if (fuelType === 'gasoline') { coeff_0 = 192.4571; coeff_1 = 0.2438; }
  else if (fuelType === 'jet a') { coeff_0 = 330.301; coeff_1 = 0; }
  else if (fuelType === 'diesel') { coeff_0 = 103.872; coeff_1 = 0.2701; }

  const alpha_60 = round((coeff_0 / (rho_60 * rho_60)) + (coeff_1 / rho_60), 9);
  const vcf = round(Math.exp(-alpha_60 * delta_t * (1 + 0.8 * alpha_60 * delta_t)), 5);
  const netVol = Math.round(grossVol * vcf);

  return { vcf, netVol };
};

// 3. Weight / Volume Conversions
export const calculateWgtVol = (corrApiStr: string, fromUnit: WgtVolUnit, amountStr: string) => {
  const corrApi = parseFloat(corrApiStr);
  const amount = parseFloat(amountStr);

  if (isNaN(corrApi) || isNaN(amount) || corrApi < 10 || corrApi > 100) return null;

  const sg = 141.5 / (corrApi + 131.5);
  const L_PER_GAL = 3.78541;
  const LB_PER_KG = 2.20462;

  let liters = 0;
  switch (fromUnit) {
    case 'gal': liters = amount * L_PER_GAL; break;
    case 'l': liters = amount; break;
    case 'kg': liters = amount / sg; break;
    case 'lb': liters = (amount / LB_PER_KG) / sg; break;
  }

  return {
    gal: Math.round(liters / L_PER_GAL),
    l: Math.round(liters),
    kg: Math.round(liters * sg),
    lb: Math.round((liters * sg) * LB_PER_KG)
  };
};