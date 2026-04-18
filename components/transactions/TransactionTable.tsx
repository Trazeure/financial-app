'use client'
import { useState } from 'react'
import { Search, SlidersHorizontal, Plus, ArrowUpDown } from 'lucide-react'
import { Transaction, Config } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CATEGORIES, PAYMENT_METHODS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { getCategoryIcon } from '@/components/dashboard/RecentTransactions'
import { clsx } from 'clsx'

interface TransactionTableProps {
  transactions: Transaction[]
  config: Config
  onAdd: () => void
  onEdit: (t: Transaction) => void
}

type SortKey = 'fecha' | 'monto'

export function TransactionTable({ transactions, config, onAdd, onEdit }: TransactionTableProps) {
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState<'all' | 'ingreso' | 'gasto'>('all')
  const [categoriaFilter, setCategoriaFilter] = useState('')
  const [metodoFilter, setMetodoFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('fecha')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = transactions
    .filter(t => {
      if (tipoFilter !== 'all' && t.tipo !== tipoFilter) return false
      if (categoriaFilter && t.categoria !== categoriaFilter) return false
      if (metodoFilter && t.metodoPago !== metodoFilter) return false
      if (search && !t.descripcion.toLowerCase().includes(search.toLowerCase()) &&
          !t.categoria.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      const aVal = sortKey === 'fecha' ? a.fecha : a.monto
      const bVal = sortKey === 'fecha' ? b.fecha : b.monto
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar transacciones..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded bg-surface focus:outline-none focus:ring-1 focus:ring-balance/50 focus:border-balance/50"
          />
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowFilters(v => !v)}>
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filtros
        </Button>
        <Button size="sm" onClick={onAdd}>
          <Plus className="w-3.5 h-3.5" />
          Nueva
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-background border border-border rounded">
          <select
            value={tipoFilter}
            onChange={e => setTipoFilter(e.target.value as typeof tipoFilter)}
            className="text-sm border border-border rounded px-3 py-2 bg-surface focus:outline-none focus:ring-1 focus:ring-balance/50"
          >
            <option value="all">Todos los tipos</option>
            <option value="ingreso">Ingresos</option>
            <option value="gasto">Gastos</option>
          </select>
          <select
            value={categoriaFilter}
            onChange={e => setCategoriaFilter(e.target.value)}
            className="text-sm border border-border rounded px-3 py-2 bg-surface focus:outline-none focus:ring-1 focus:ring-balance/50"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map(c => (
              <option key={c.nombre} value={c.nombre}>{c.nombre}</option>
            ))}
          </select>
          <select
            value={metodoFilter}
            onChange={e => setMetodoFilter(e.target.value)}
            className="text-sm border border-border rounded px-3 py-2 bg-surface focus:outline-none focus:ring-1 focus:ring-balance/50"
          >
            <option value="">Todos los métodos</option>
            {PAYMENT_METHODS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">
                  Categoría
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wide hidden sm:table-cell">
                  Descripción
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wide cursor-pointer hover:text-text-secondary transition-colors"
                  onClick={() => toggleSort('fecha')}
                >
                  <span className="flex items-center gap-1">
                    Fecha <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wide hidden md:table-cell">
                  Método
                </th>
                <th
                  className="text-right px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wide cursor-pointer hover:text-text-secondary transition-colors"
                  onClick={() => toggleSort('monto')}
                >
                  <span className="flex items-center gap-1 justify-end">
                    Monto <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-text-muted">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                filtered.map(t => {
                  const Icon = getCategoryIcon(t.categoria)
                  return (
                    <tr
                      key={t.id}
                      onClick={() => onEdit(t)}
                      className="border-b border-border last:border-0 hover:bg-background cursor-pointer transition-colors duration-150"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={clsx(
                            'w-7 h-7 rounded flex items-center justify-center shrink-0',
                            t.tipo === 'ingreso' ? 'bg-income-light' : 'bg-background border border-border'
                          )}>
                            <Icon className={clsx('w-3.5 h-3.5', t.tipo === 'ingreso' ? 'text-income' : 'text-text-secondary')} />
                          </div>
                          <span className="text-sm text-text-primary">{t.categoria}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-text-secondary truncate max-w-48 block">{t.descripcion || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-text-secondary">{formatDate(t.fecha)}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-text-muted bg-background border border-border rounded px-2 py-0.5">
                          {t.metodoPago}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={clsx('text-sm font-medium font-serif italic', t.tipo === 'ingreso' ? 'text-income' : 'text-expense')}>
                          {t.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(t.monto, config.moneda)}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-text-muted">
        {filtered.length} transaccion{filtered.length !== 1 ? 'es' : ''}
      </p>
    </div>
  )
}
