"use client"

import React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCurrency } from "@/contexts/currency-context"
import { CurrencyCode, getCurrencySymbol } from "@/lib/currency"

const labels: Record<CurrencyCode, string> = {
  SAR: "ريال سعودي",
  USD: "دولار أمريكي",
  AED: "درهم إماراتي",
  EUR: "يورو",
  EGP: "جنيه مصري",
  KWD: "دينار كويتي",
  QAR: "ريال قطري",
}

export function CurrencySelector({ size = "default" as const }: { size?: "sm" | "default" }) {
  const { currency, setCurrency, supported, refreshRates, isLoading } = useCurrency()

  return (
    <div className="flex items-center gap-2">
      <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
        <SelectTrigger size={size} className="min-w-[120px] arabic-text">
          <SelectValue placeholder="العملة" />
        </SelectTrigger>
        <SelectContent align="end">
          {supported.map((c) => (
            <SelectItem key={c} value={c} className="arabic-text">
              <span className="flex items-center gap-2">
                <span className="font-semibold">{c}</span>
                <span className="text-muted-foreground">{labels[c]}</span>
                <span className="text-muted-foreground">{getCurrencySymbol(c)}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <button
        onClick={refreshRates}
        disabled={isLoading}
        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
        title="تحديث أسعار الصرف"
      >
        <svg
          className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  )
}
