export const IVA_RATE = 0.19;

export interface IvaBreakdown {
  gross: number;
  net: number;
  iva: number;
}

export function ivaBreakdown(gross: number): IvaBreakdown {
  const net = gross / (1 + IVA_RATE);
  return {
    gross,
    net,
    iva: Math.round((gross - net) * 100) / 100,
  };
}

export function ivaOf(gross: number): number {
  return ivaBreakdown(gross).iva;
}