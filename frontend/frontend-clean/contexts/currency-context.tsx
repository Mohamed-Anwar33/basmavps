"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { 
  CurrencyCode, 
  EXCHANGE_RATES, 
  SUPPORTED_CURRENCIES, 
  convertAmount, 
  formatCurrency,
  initializeExchangeRates,
  fetchExchangeRates,
  updateExchangeRates
} from "@/lib/currency"

export type CurrencyContextValue = {
  currency: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
  rates: Record<CurrencyCode, number>
  convert: (amount: number, from: CurrencyCode, to?: CurrencyCode) => number
  format: (amount: number, currency?: CurrencyCode) => string
  supported: CurrencyCode[]
  refreshRates: () => Promise<void>
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined)

const STORAGE_KEY = "selected_currency"

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("SAR")
  const [rates, setRates] = useState(EXCHANGE_RATES)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize exchange rates on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      try {
        await initializeExchangeRates()
        setRates({ ...EXCHANGE_RATES })
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    }
    
    init()
  }, [])

  // Load saved currency preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null
      if (saved && SUPPORTED_CURRENCIES.includes(saved)) {
        setCurrencyState(saved)
      }
    } catch {}
  }, [])

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {}
  }

  const refreshRates = async () => {
    setIsLoading(true)
    try {
      const newRates = await fetchExchangeRates()
      updateExchangeRates(newRates)
      setRates({ ...newRates })
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const value = useMemo<CurrencyContextValue>(() => ({
    currency,
    setCurrency,
    rates,
    convert: (amount, from, to) => convertAmount(amount, from, to ?? currency, rates),
    format: (amount, curr = currency) => formatCurrency(amount, curr),
    supported: SUPPORTED_CURRENCIES,
    refreshRates,
    isLoading,
  }), [currency, rates, isLoading])

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider")
  return ctx
}
