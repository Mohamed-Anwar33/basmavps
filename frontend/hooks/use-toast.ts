import { useState } from "react"

interface ToastProps {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    const newToast = { title, description, variant }
    setToasts(prev => [...prev, newToast])
    
    // Auto remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t !== newToast))
    }, 3000)
    
    // For now, just use console.log as a simple implementation
  }

  return { toast }
}
