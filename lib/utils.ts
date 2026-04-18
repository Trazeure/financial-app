import { Transaction, MonthlyData, CategoryTotal } from './types'

export function formatCurrency(amount: number, currency = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function getCurrentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7)
}

export function filterByMonth(transactions: Transaction[], monthKey: string): Transaction[] {
  return transactions.filter(t => getMonthKey(t.fecha) === monthKey)
}

export function calcTotals(transactions: Transaction[]) {
  const ingresos = transactions
    .filter(t => t.tipo === 'ingreso')
    .reduce((s, t) => s + t.monto, 0)
  const gastos = transactions
    .filter(t => t.tipo === 'gasto')
    .reduce((s, t) => s + t.monto, 0)
  return { ingresos, gastos, balance: ingresos - gastos }
}

export function calcCategoryTotals(transactions: Transaction[]): CategoryTotal[] {
  const gastos = transactions.filter(t => t.tipo === 'gasto')
  const total = gastos.reduce((s, t) => s + t.monto, 0)
  const map: Record<string, number> = {}
  gastos.forEach(t => {
    map[t.categoria] = (map[t.categoria] || 0) + t.monto
  })
  return Object.entries(map)
    .map(([categoria, tot]) => ({
      categoria,
      total: tot,
      porcentaje: total > 0 ? (tot / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

export function calcMonthlyData(transactions: Transaction[], months = 6): MonthlyData[] {
  const result: MonthlyData[] = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(d)
    const filtered = filterByMonth(transactions, key)
    const { ingresos, gastos, balance } = calcTotals(filtered)
    result.push({ month: label, ingresos, gastos, balance })
  }
  return result
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}
