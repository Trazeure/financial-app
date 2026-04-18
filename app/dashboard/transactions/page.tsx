'use client'
import { useState } from 'react'
import { useApp } from '../layout'
import { TransactionTable } from '@/components/transactions/TransactionTable'
import { TransactionModal } from '@/components/transactions/TransactionModal'
import { GoogleSignIn } from '@/components/sheets/GoogleSignIn'
import { useToast } from '@/components/ui/Toast'
import { Transaction } from '@/lib/types'

export default function TransactionsPage() {
  const { transactions, config, addTx, updateTx, deleteTx, isConnected, signIn, sheetsConnecting } = useApp()
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Transaction | null>(null)

  if (!isConnected) {
    return (
      <GoogleSignIn
        onSignIn={async () => {
          try { await signIn() }
          catch (e) { toast('error', e instanceof Error ? e.message : 'Error') }
        }}
        loading={sheetsConnecting}
      />
    )
  }

  return (
    <div className="px-6 py-7 max-w-5xl mx-auto">
      <div className="mb-7">
        <h1 className="font-serif italic text-2xl text-text-primary">Transacciones</h1>
        <p className="text-sm text-text-muted mt-0.5">{transactions.length} registros en total</p>
      </div>

      <TransactionTable
        transactions={transactions}
        config={config}
        onAdd={() => { setSelected(null); setModalOpen(true) }}
        onEdit={(t) => { setSelected(t); setModalOpen(true) }}
      />

      <TransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null) }}
        onSave={async (t) => { await addTx(t); toast('success', 'Transacción agregada') }}
        onUpdate={async (t) => { await updateTx(t); toast('success', 'Actualizada') }}
        onDelete={async (id) => { await deleteTx(id); toast('success', 'Eliminada') }}
        initial={selected}
      />
    </div>
  )
}
