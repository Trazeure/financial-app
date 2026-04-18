'use client'
import { useState } from 'react'
import { useApp } from '../layout'
import { TransactionTable } from '@/components/transactions/TransactionTable'
import { TransactionModal } from '@/components/transactions/TransactionModal'
import { ConnectSheets } from '@/components/sheets/ConnectSheets'
import { useToast } from '@/components/ui/Toast'
import { Transaction } from '@/lib/types'

export default function TransactionsPage() {
  const {
    transactions, config, addTx, updateTx, deleteTx,
    isConnected, getValidToken, connectSheets, setNewSpreadsheetId, sheetsConnecting,
  } = useApp()
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Transaction | null>(null)

  function openAdd() {
    setSelected(null)
    setModalOpen(true)
  }

  function openEdit(t: Transaction) {
    setSelected(t)
    setModalOpen(true)
  }

  async function handleSave(t: Omit<Transaction, 'id'>) {
    try {
      await addTx(t)
      toast('success', 'Transacción agregada')
    } catch {
      toast('error', 'Error al guardar')
    }
  }

  async function handleUpdate(t: Transaction) {
    try {
      await updateTx(t)
      toast('success', 'Transacción actualizada')
    } catch {
      toast('error', 'Error al actualizar')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTx(id)
      toast('success', 'Transacción eliminada')
    } catch {
      toast('error', 'Error al eliminar')
    }
  }

  if (!isConnected) {
    return (
      <ConnectSheets
        onConnect={async (id) => {
          await connectSheets(id)
          toast('success', 'Hoja conectada')
        }}
        onNew={(id) => {
          setNewSpreadsheetId(id)
          toast('success', 'Hoja creada y conectada')
        }}
        getValidToken={getValidToken}
        connecting={sheetsConnecting}
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
        onAdd={openAdd}
        onEdit={openEdit}
      />

      <TransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null) }}
        onSave={handleSave}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        initial={selected}
      />
    </div>
  )
}
