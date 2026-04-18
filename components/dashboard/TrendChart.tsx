'use client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Transaction, Config } from '@/lib/types'
import { calcMonthlyData, formatCurrency } from '@/lib/utils'

interface TrendChartProps {
  transactions: Transaction[]
  config: Config
}

export function TrendChart({ transactions, config }: TrendChartProps) {
  const data = calcMonthlyData(transactions, 6)

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <p className="text-xs text-text-secondary uppercase tracking-wide font-medium mb-6">
        Tendencia — últimos 6 meses
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#F0EDE8" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="month"
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
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="bg-surface border border-border rounded p-3 shadow-card text-xs">
                  <p className="font-medium text-text-primary mb-2">{label}</p>
                  {payload.map(p => (
                    <div key={p.dataKey} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                      <span className="text-text-secondary capitalize">{p.dataKey}:</span>
                      <span className="text-text-primary">{formatCurrency(Number(p.value), config.moneda)}</span>
                    </div>
                  ))}
                </div>
              )
            }}
          />
          <Line
            type="monotone"
            dataKey="ingresos"
            stroke="#2D6A4F"
            strokeWidth={2}
            dot={{ fill: '#2D6A4F', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="gastos"
            stroke="#C1292E"
            strokeWidth={2}
            dot={{ fill: '#C1292E', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#1B2A4A"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-5 mt-3">
        {[
          { color: '#2D6A4F', label: 'Ingresos' },
          { color: '#C1292E', label: 'Gastos' },
          { color: '#1B2A4A', label: 'Balance', dashed: true },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-text-muted">
            <svg width="16" height="8">
              <line
                x1="0" y1="4" x2="16" y2="4"
                stroke={l.color}
                strokeWidth="2"
                strokeDasharray={l.dashed ? '4 3' : 'none'}
              />
            </svg>
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}
