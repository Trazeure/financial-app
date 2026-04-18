'use client'
import Link from 'next/link'
import {
  Home, Car, UtensilsCrossed, Zap, Heart, BookOpen,
  Film, Shirt, MonitorSmartphone, CircleDot,
  Banknote, Code2, TrendingUp, Gift, ChevronRight,
} from 'lucide-react'
import { Transaction, Config } from '@/lib/types'
import { formatCurrency, formatDate, filterByMonth, getCurrentMonthKey } from '@/lib/utils'
import { clsx } from 'clsx'

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Vivienda': Home,
  'Transporte': Car,
  'Alimentación': UtensilsCrossed,
  'Servicios': Zap,
  'Salud': Heart,
  'Educación': BookOpen,
  'Entretenimiento': Film,
  'Ropa': Shirt,
  'Suscripciones': MonitorSmartphone,
  'Salario': Banknote,
  'Freelance': Code2,
  'Inversiones': TrendingUp,
  'Regalos': Gift,
}

export function getCategoryIcon(categoria: string) {
  return CATEGORY_ICONS[categoria] || CircleDot
}

interface RecentTransactionsProps {
  transactions: Transaction[]
  config: Config
}

export function RecentTransactions({ transactions, config }: RecentTransactionsProps) {
  const currentKey = getCurrentMonthKey()
  const recent = filterByMonth(transactions, currentKey)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5)

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-text-secondary uppercase tracking-wide font-medium">
          Últimas transacciones
        </p>
        <Link
          href="/dashboard/transactions"
          className="flex items-center gap-1 text-xs text-text-muted hover:text-balance transition-colors"
        >
          Ver todas <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-3">
            <circle cx="20" cy="20" r="18" stroke="#E8E5E0" strokeWidth="2" fill="none" />
            <path d="M14 20h12M20 14v12" stroke="#E8E5E0" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-text-muted">Sin transacciones este mes</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {recent.map(t => {
            const Icon = getCategoryIcon(t.categoria)
            return (
              <div key={t.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className={clsx(
                  'w-8 h-8 rounded flex items-center justify-center shrink-0',
                  t.tipo === 'ingreso' ? 'bg-income-light' : 'bg-background'
                )}>
                  <Icon className={clsx('w-3.5 h-3.5', t.tipo === 'ingreso' ? 'text-income' : 'text-text-secondary')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary font-medium truncate">{t.descripcion || t.categoria}</p>
                  <p className="text-xs text-text-muted">{formatDate(t.fecha)} · {t.metodoPago}</p>
                </div>
                <p className={clsx('text-sm font-medium shrink-0 font-serif italic', t.tipo === 'ingreso' ? 'text-income' : 'text-expense')}>
                  {t.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(t.monto, config.moneda)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
