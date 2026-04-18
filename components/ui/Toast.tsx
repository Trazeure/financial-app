'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { clsx } from 'clsx'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={clsx(
              'flex items-center gap-3 px-4 py-3 rounded border shadow-card pointer-events-auto bg-surface',
              'animate-in slide-in-from-right-4 duration-200',
              t.type === 'success' && 'border-income/30',
              t.type === 'error' && 'border-expense/30',
              t.type === 'info' && 'border-border'
            )}
          >
            {t.type === 'success' && <CheckCircle className="w-4 h-4 text-income shrink-0" />}
            {t.type === 'error' && <XCircle className="w-4 h-4 text-expense shrink-0" />}
            {t.type === 'info' && <AlertCircle className="w-4 h-4 text-accent shrink-0" />}
            <span className="text-sm text-text-primary max-w-xs">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="text-text-muted hover:text-text-primary transition-colors ml-auto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}
