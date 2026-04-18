'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Transaction, Config } from '@/lib/types'
import { calcCategoryTotals, filterByMonth, getCurrentMonthKey, formatCurrency } from '@/lib/utils'

interface ExpensesChartProps {
  transactions: Transaction[]
  config: Config
}

const COLORS = [
  '#1B2A4A', '#2D6A4F', '#C1292E', '#D4A373',
  '#4A6FA5', '#68A063', '#E07A5F', '#3D405B',
  '#81B29A', '#F2CC8F',
]

export function ExpensesChart({ transactions, config }: ExpensesChartProps) {
  const currentKey = getCurrentMonthKey()
  const currentMonth = filterByMonth(transactions, currentKey)
  const totals = calcCategoryTotals(currentMonth).slice(0, 8)

  if (totals.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6">
        <p className="text-xs text-text-secondary uppercase tracking-wide font-medium mb-6">
          Gastos por categoría
        </p>
        <EmptyState />
      </div>
    )
  }

  const formatted = totals.map(t => ({
    name: t.categoria,
    value: t.total,
    pct: t.porcentaje,
  }))

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <p className="text-xs text-text-secondary uppercase tracking-wide font-medium mb-6">
        Gastos por categoría — este mes
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={formatted} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6B6560', fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6B6560', fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            cursor={{ fill: '#FAFAF8' }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null
              const d = payload[0].payload
              return (
                <div className="bg-surface border border-border rounded p-3 shadow-card text-xs">
                  <p className="font-medium text-text-primary mb-1">{d.name}</p>
                  <p className="text-text-secondary">{formatCurrency(d.value, config.moneda)}</p>
                  <p className="text-text-muted">{d.pct.toFixed(1)}% del total</p>
                </div>
              )
            }}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={48}>
            {formatted.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-3">
        <rect x="8" y="24" width="8" height="16" rx="2" fill="#E8E5E0" />
        <rect x="20" y="16" width="8" height="24" rx="2" fill="#E8E5E0" />
        <rect x="32" y="32" width="8" height="8" rx="2" fill="#E8E5E0" />
      </svg>
      <p className="text-sm text-text-muted">Sin gastos este mes</p>
    </div>
  )
}
