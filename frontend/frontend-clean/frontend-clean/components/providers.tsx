"use client"

import React from "react"
import { App } from "antd"
import { CurrencyProvider } from "@/contexts/currency-context"
import { ToastProvider } from "@/contexts/toast-context"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <App>
      <CurrencyProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </CurrencyProvider>
    </App>
  )
}
