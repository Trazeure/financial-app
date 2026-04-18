'use client'
import { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useApp } from './layout'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { ExpensesChart } from '@/components/dashboard/ExpensesChart'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { TransactionModal } from '@/components/transactions/TransactionModal'
import { GoogleSignIn } from '@/components/sheets/GoogleSignIn'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { Transaction } from '@/lib/types'

export default function DashboardPage() {
  const { transactions, config, loading, reload, addTx, isConnected, signIn, sheetsConnecting } = useApp()
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)

  async function handleAdd(t: Omit<Transaction, 'id'>) {
    try {
      await addTx(t)
      toast('success', 'Transacción agregada')
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Error al guardar')
    }
  }

  if (!isConnected) {
    return (
      <GoogleSignIn
        onSignIn={async () => {
          try {
            await signIn()
          } catch (e) {
            toast('error', e instanceof Error ? e.message : 'Error al conectar')
          }
        }}
        loading={sheetsConnecting}
      />
    )
  }

  return (
    <div className="px-6 py-7 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-serif italic text-2xl text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(new Date())}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={reload} loading={loading}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva transacción</span>
          </Button>
        </div>
      </div>

      {loading && transactions.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <svg className="w-5 h-5 animate-spin text-text-muted" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <StatsCards transactions={transactions} config={config} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ExpensesChart transactions={transactions} config={config} />
            <TrendChart transactions={transactions} config={config} />
          </div>
          <RecentTransactions transactions={transactions} config={config} />
        </div>
      )}

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAdd} />
    </div>
  )
}
