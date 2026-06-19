export type FuelType = 'gasoline' | 'jet a' | 'diesel';

// Robust rounding function to avoid floating-point errors
const round = (value: number, decimals: number): number => {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
};

export const calculateCorrectedApi = (
  fuelType: FuelType,
  apiString: string,
  tempString: string
): number | null => {
  const api = parseFloat(apiString);
  const temp = parseFloat(tempString);

  // 1. Validation
  if (isNaN(api) || isNaN(temp)) return null;
  if (temp < -50 || temp > 150) return null;
  if (api < 10 || api > 100) return null;

  // 2. Initial variables
  const dt = round(temp - 60, 1);
  const rho_obs = round((141.5 / (api + 131.5)) * 999.016, 1);

  // 3. Constants
  let coeff_0 = 0;
  let coeff_1 = 0;

  switch (fuelType) {
    case 'gasoline':
      coeff_0 = 192.4571;
      coeff_1 = 0.2438;
      break;
    case 'jet a':
      coeff_0 = 330.301;
      coeff_1 = 0;
      break;
    case 'diesel':
      coeff_0 = 103.872;
      coeff_1 = 0.2701;
      break;
  }

  // Helper functions for Iterative Convergence
  const calcAlpha = (rho: number) => round((coeff_0 / (rho * rho)) + (coeff_1 / rho), 9);
  const calcCtl = (alpha: number) => Math.exp(-alpha * dt * (1 + 0.8 * alpha * dt));

  // 4. Iterative Convergence (3 Steps)
  // Step 1
  const alpha_guess = calcAlpha(rho_obs);
  const ctl_guess = calcCtl(alpha_guess);

  // Step 2
  const rho_1 = round(rho_obs / ctl_guess, 1);
  const alpha_1 = calcAlpha(rho_1);
  const ctl_1 = calcCtl(alpha_1);

  // Step 3
  const rho_2 = round(rho_obs / ctl_1, 1);
  const alpha_2 = calcAlpha(rho_2);
  const ctl_2 = calcCtl(alpha_2);

  // Final Density
  const rho_3 = round(rho_obs / ctl_2, 1);

  // 5. Final Corrected API at 60°F
  const finalApi = round((141.5 / (rho_3 / 999.016)) - 131.5, 1);

  return finalApi;
};