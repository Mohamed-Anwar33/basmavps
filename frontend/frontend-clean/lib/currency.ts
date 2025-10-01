export type CurrencyCode = "SAR" | "USD" | "AED" | "EUR" | "EGP" | "KWD" | "QAR"

// Default exchange rates (fallback values)
// These will be updated with real-time rates from API
export const DEFAULT_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  SAR: 3.75,   // 1 USD = 3.75 SAR
  USD: 1,      // Base currency
  AED: 3.67,   // 1 USD = 3.67 AED
  EUR: 0.92,   // 1 USD = 0.92 EUR
  EGP: 30.8,   // 1 USD = 30.8 EGP
  KWD: 0.31,   // 1 USD = 0.31 KWD
  QAR: 3.64,   // 1 USD = 3.64 QAR
}

// Current exchange rates (will be updated from API)
export let EXCHANGE_RATES: Record<CurrencyCode, number> = { ...DEFAULT_EXCHANGE_RATES }

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ["SAR", "USD", "AED", "EUR", "EGP", "KWD", "QAR"]

export function getCurrencySymbol(code: CurrencyCode): string {
  switch (code) {
    case "SAR":
      return "ر.س"
    case "USD":
      return "$"
    case "AED":
      return "د.إ"
    case "EUR":
      return "€"
    case "EGP":
      return "ج.م"
    case "KWD":
      return "د.ك"
    case "QAR":
      return "ر.ق"
    default:
      return code
  }
}

// Convert amount between any two currencies using USD as the base
export function convertAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: Record<CurrencyCode, number> = EXCHANGE_RATES
): number {
  if (!amount || from === to) return amount
  const fromRate = rates[from] ?? 1
  const toRate = rates[to] ?? 1
  // Convert to USD first, then to target
  const amountInUsd = amount / fromRate
  const converted = amountInUsd * toRate
  // round to 2 decimals for display
  return Math.round(converted * 100) / 100
}

// Fetch real-time exchange rates from API
export async function fetchExchangeRates(): Promise<Record<CurrencyCode, number>> {
  try {
    // Using exchangerate-api.com (free tier allows 1500 requests/month)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    const data = await response.json()
    
    if (data.rates) {
      return {
        USD: 1, // Base currency
        SAR: data.rates.SAR || DEFAULT_EXCHANGE_RATES.SAR,
        AED: data.rates.AED || DEFAULT_EXCHANGE_RATES.AED,
        EUR: data.rates.EUR || DEFAULT_EXCHANGE_RATES.EUR,
        EGP: data.rates.EGP || DEFAULT_EXCHANGE_RATES.EGP,
        KWD: data.rates.KWD || DEFAULT_EXCHANGE_RATES.KWD,
        QAR: data.rates.QAR || DEFAULT_EXCHANGE_RATES.QAR,
      }
    }
  } catch (error) {
  }
  
  return DEFAULT_EXCHANGE_RATES
}

// Update global exchange rates
export function updateExchangeRates(newRates: Record<CurrencyCode, number>) {
  EXCHANGE_RATES = { ...newRates }
  // Save to localStorage for persistence
  try {
    localStorage.setItem('exchange_rates', JSON.stringify(newRates))
    localStorage.setItem('exchange_rates_timestamp', Date.now().toString())
  } catch (error) {
  }
}

// Load exchange rates from localStorage
export function loadStoredExchangeRates(): Record<CurrencyCode, number> | null {
  try {
    const stored = localStorage.getItem('exchange_rates')
    const timestamp = localStorage.getItem('exchange_rates_timestamp')
    
    if (stored && timestamp) {
      const age = Date.now() - parseInt(timestamp)
      // Use stored rates if they're less than 1 hour old
      if (age < 60 * 60 * 1000) {
        return JSON.parse(stored)
      }
    }
  } catch (error) {
  }
  
  return null
}

// Initialize exchange rates (call this on app startup)
export async function initializeExchangeRates(): Promise<void> {
  // First try to load from localStorage
  const storedRates = loadStoredExchangeRates()
  if (storedRates) {
    EXCHANGE_RATES = storedRates
    return
  }
  
  // If no valid stored rates, fetch from API
  const freshRates = await fetchExchangeRates()
  updateExchangeRates(freshRates)
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  locale: string = "ar-SA"
): string {
  try {
    const formatted = amount.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    return `${formatted} ${getCurrencySymbol(currency)}`
  } catch {
    return `${amount} ${getCurrencySymbol(currency)}`
  }
}
