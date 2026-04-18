'use client'
import { TrendingUp, TrendingDown, Scale, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Transaction, Config } from '@/lib/types'
import {
  calcTotals,
  filterByMonth,
  getCurrentMonthKey,
  getMonthKey,
  formatCurrency,
  percentChange,
} from '@/lib/utils'
import { clsx } from 'clsx'

interface StatsCardsProps {
  transactions: Transaction[]
  config: Config
}

export function StatsCards({ transactions, config }: StatsCardsProps) {
  const currentKey = getCurrentMonthKey()
  const prevDate = new Date()
  prevDate.setMonth(prevDate.getMonth() - 1)
  const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`

  const current = calcTotals(filterByMonth(transactions, currentKey))
  const prev = calcTotals(filterByMonth(transactions, prevKey))

  const ahorroActual = current.ingresos > 0 ? (current.balance / current.ingresos) * 100 : 0
  const metaAhorro = config.metaAhorro || 20
  const progreso = Math.min((ahorroActual / metaAhorro) * 100, 100)

  const ingresosChange = percentChange(current.ingresos, prev.ingresos)
  const gastosChange = percentChange(current.gastos, prev.gastos)

  const r = 20
  const circ = 2 * Math.PI * r
  const offset = circ - (progreso / 100) * circ

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Ingresos"
        value={formatCurrency(current.ingresos, config.moneda)}
        icon={<TrendingUp className="w-4 h-4 text-income" />}
        iconBg="bg-income-light"
        valueColor="text-income"
        change={ingresosChange}
        changePositiveIsGood={true}
      />
      <StatCard
        label="Gastos"
        value={formatCurrency(current.gastos, config.moneda)}
        icon={<TrendingDown className="w-4 h-4 text-expense" />}
        iconBg="bg-expense-light"
        valueColor="text-expense"
        change={gastosChange}
        changePositiveIsGood={false}
      />
      <StatCard
        label="Balance"
        value={formatCurrency(current.balance, config.moneda)}
        icon={<Scale className="w-4 h-4 text-balance" />}
        iconBg="bg-balance/10"
        valueColor={current.balance >= 0 ? 'text-income' : 'text-expense'}
      />
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wide font-medium mb-1">
              Ahorro
            </p>
            <p className="font-serif italic text-xl text-text-primary">
              {ahorroActual.toFixed(1)}%
            </p>
            <p className="text-xs text-text-muted mt-0.5">meta: {metaAhorro}%</p>
          </div>
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 -rotate-90">
              <circle cx="24" cy="24" r={r} fill="none" stroke="#E8E5E0" strokeWidth="3" />
              <circle
                cx="24"
                cy="24"
                r={r}
                fill="none"
                stroke={progreso >= 100 ? '#2D6A4F' : '#D4A373'}
                strokeWidth="3"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <Target className="w-4 h-4 absolute inset-0 m-auto text-text-muted" />
          </div>
        </div>
        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-700', progreso >= 100 ? 'bg-income' : 'bg-accent')}
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
  valueColor,
  change,
  changePositiveIsGood,
}: {
  label: string
  value: string
  icon: React.ReactNode
  iconBg: string
  valueColor: string
  change?: number | null
  changePositiveIsGood?: boolean
}) {
  const isGood = change !== null && change !== undefined
    ? (changePositiveIsGood ? change >= 0 : change <= 0)
    : null

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={clsx('w-8 h-8 rounded flex items-center justify-center', iconBg)}>
          {icon}
        </div>
        {change !== null && change !== undefined && (
          <div className={clsx('flex items-center gap-0.5 text-xs font-medium', isGood ? 'text-income' : 'text-expense')}>
            {change >= 0
              ? <ArrowUpRight className="w-3 h-3" />
              : <ArrowDownRight className="w-3 h-3" />
            }
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-xs text-text-secondary uppercase tracking-wide font-medium mb-1">{label}</p>
      <p className={clsx('font-serif italic text-xl', valueColor)}>{value}</p>
    </div>
  )
}
