export const FALLBACK_USD_TO_UYU = 43;

export async function getUsdToUyu(): Promise<number> {
  try {
    const res = await fetch(
      "https://cdn.jsdelivr.net/gh/fawazahmed0/exchange-api@1/latest/currencies/usd/uyu.json",
      { next: { revalidate: 3600 } } // cache 1 hora
    );
    if (!res.ok) return FALLBACK_USD_TO_UYU;
    const data = await res.json();
    return Math.round(data.uyu) ?? FALLBACK_USD_TO_UYU;
  } catch {
    return FALLBACK_USD_TO_UYU;
  }
}
