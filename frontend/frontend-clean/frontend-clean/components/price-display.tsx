"use client"

import React from "react"
import { useCurrency } from "@/contexts/currency-context"
import { CurrencyCode, SUPPORTED_CURRENCIES } from "@/lib/currency"
import { cn } from "@/lib/utils"

export type Price = {
  amount: number
  currency: string
  originalAmount?: number
  originalCurrency?: string
}

function normalize(code: string | undefined): CurrencyCode {
  const up = (code || "SAR").toUpperCase() as CurrencyCode
  return (SUPPORTED_CURRENCIES.includes(up) ? up : "SAR") as CurrencyCode
}

export function PriceDisplay({
  price,
  className,
  showLabel = false,
  originalClassName,
  currentClassName,
}: {
  price: Price
  className?: string
  showLabel?: boolean
  originalClassName?: string
  currentClassName?: string
}) {
  const { currency: to, convert, format } = useCurrency()

  // Handle undefined or null price
  if (!price || (!price.amount && price.amount !== 0)) {
    return <span className={className}>غير محدد</span>
  }

  const from = normalize(price.currency)
  const fromOriginal = normalize(price.originalCurrency || price.currency)

  const current = convert(price.amount, from, to)
  const original = price.originalAmount && price.originalAmount > price.amount
    ? convert(price.originalAmount, fromOriginal, to)
    : null

  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      {original ? (
        <>
          <span className={cn("line-through text-muted-foreground text-sm", originalClassName)}>{format(original)}</span>
          <span className={cn("font-bold", currentClassName)}>{format(current)}</span>
        </>
      ) : (
        <span className={cn("font-bold", currentClassName)}>{format(current)}</span>
      )}
      {showLabel && (
        <span className="text-xs text-muted-foreground">(تشمل تغيير العملة)</span>
      )}
    </span>
  )
}
