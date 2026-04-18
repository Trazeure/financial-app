'use client'
import { useState, useEffect, useCallback } from 'react'
import { Transaction, Config } from '@/lib/types'
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getConfig,
  saveConfig,
} from '@/lib/sheets-api'
import { CONFIG_DEFAULTS } from '@/lib/constants'

export function useTransactions(
  getValidToken: () => Promise<string>,
  spreadsheetId: string | null,
  isConnected: boolean
) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [config, setConfig] = useState<Config>(CONFIG_DEFAULTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!isConnected || !spreadsheetId) return
    setLoading(true)
    setError(null)
    try {
      const token = await getValidToken()
      const [txs, cfg] = await Promise.all([
        getTransactions(token, spreadsheetId),
        getConfig(token, spreadsheetId),
      ])
      setTransactions(txs)
      setConfig(cfg)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [isConnected, spreadsheetId, getValidToken])

  useEffect(() => {
    reload()
  }, [reload])

  const addTx = useCallback(
    async (t: Omit<Transaction, 'id'>) => {
      if (!spreadsheetId) return
      const token = await getValidToken()
      const newTx = await addTransaction(token, spreadsheetId, t)
      setTransactions(prev => [...prev, newTx])
      return newTx
    },
    [getValidToken, spreadsheetId]
  )

  const updateTx = useCallback(
    async (updated: Transaction) => {
      if (!spreadsheetId) return
      const token = await getValidToken()
      await updateTransaction(token, updated.id, spreadsheetId, transactions, updated)
      setTransactions(prev => prev.map(t => (t.id === updated.id ? updated : t)))
    },
    [getValidToken, spreadsheetId, transactions]
  )

  const deleteTx = useCallback(
    async (id: string) => {
      if (!spreadsheetId) return
      const token = await getValidToken()
      await deleteTransaction(token, id, spreadsheetId, transactions)
      setTransactions(prev => prev.filter(t => t.id !== id))
    },
    [getValidToken, spreadsheetId, transactions]
  )

  const updateConfig = useCallback(
    async (newConfig: Config) => {
      if (!spreadsheetId) return
      const token = await getValidToken()
      await saveConfig(token, spreadsheetId, newConfig)
      setConfig(newConfig)
    },
    [getValidToken, spreadsheetId]
  )

  return {
    transactions,
    config,
    loading,
    error,
    reload,
    addTx,
    updateTx,
    deleteTx,
    updateConfig,
  }
}
