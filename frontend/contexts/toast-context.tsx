"use client"

import React, { createContext, useCallback, useContext, useMemo, useState } from "react"

export type ToastVariant = "default" | "success" | "warning" | "destructive"

export type Toast = {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

type ToastContextType = {
  toasts: Toast[]
  toast: (t: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2)
    const newToast: Toast = { id, ...t }
    setToasts((prev) => [...prev, newToast])
    // auto-remove after 3.5s
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3500)
  }, [])

  const value = useMemo(() => ({ toasts, toast }), [toasts, toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToastContext must be used within ToastProvider")
  return ctx
}

export function ToastContainer() {
  const ctx = useContext(ToastContext)
  if (!ctx) return null
  const { toasts } = ctx
  const base = "fixed left-4 bottom-4 z-[9999] flex flex-col gap-2"
  const card = (variant?: ToastVariant) => {
    const baseCard = "w-80 max-w-[90vw] rounded-md border p-3 shadow-md bg-white text-slate-800"
    const variants: Record<ToastVariant, string> = {
      default: baseCard,
      success: baseCard + " border-green-200 bg-green-50 text-green-900",
      warning: baseCard + " border-amber-200 bg-amber-50 text-amber-900",
      destructive: baseCard + " border-red-200 bg-red-50 text-red-900",
    }
    return variants[variant || "default"]
  }
  return (
    <div className={base} role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={card(t.variant)}>
          <div className="font-bold mb-1 arabic-text">{t.title}</div>
          {t.description && <div className="text-sm arabic-text opacity-80">{t.description}</div>}
        </div>
      ))}
    </div>
  )
}
