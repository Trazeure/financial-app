'use client'
import { useEffect, ReactNode, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useSheets } from '@/hooks/useSheets'
import { useTransactions } from '@/hooks/useTransactions'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Transaction, Config } from '@/lib/types'

interface AppContextValue {
  transactions: Transaction[]
  config: Config
  loading: boolean
  error: string | null
  reload: () => void
  addTx: (t: Omit<Transaction, 'id'>) => Promise<Transaction | undefined>
  updateTx: (t: Transaction) => Promise<void>
  deleteTx: (id: string) => Promise<void>
  updateConfig: (c: Config) => Promise<void>
  isConnected: boolean
  spreadsheetId: string | null
  getValidToken: () => Promise<string>
  requestToken: () => Promise<import('@/lib/types').GoogleToken>
  connectSheets: (id: string) => Promise<void>
  setNewSpreadsheetId: (id: string) => void
  disconnect: () => void
  sheetsConnecting: boolean
}

const AppContext = createContext<AppContextValue | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within DashboardLayout')
  return ctx
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading, logout } = useAuth()
  const router = useRouter()

  const sheets = useSheets()
  const txData = useTransactions(sheets.getValidToken, sheets.spreadsheetId, sheets.isConnected)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <svg className="w-5 h-5 animate-spin text-text-muted" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <AppContext.Provider
      value={{
        ...txData,
        isConnected: sheets.isConnected,
        spreadsheetId: sheets.spreadsheetId,
        getValidToken: sheets.getValidToken,
        requestToken: sheets.requestToken,
        connectSheets: sheets.connectSheets,
        setNewSpreadsheetId: sheets.setNewSpreadsheetId,
        disconnect: sheets.disconnect,
        sheetsConnecting: sheets.connecting,
      }}
    >
      <div className="flex min-h-screen bg-background">
        <Sidebar onLogout={logout} />
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          {children}
        </main>
        <MobileNav />
      </div>
    </AppContext.Provider>
  )
}
