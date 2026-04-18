'use client'
import { useState, useEffect, useCallback } from 'react'
import { GoogleToken } from '@/lib/types'
import { STORAGE_KEYS } from '@/lib/constants'
import { isTokenValid, verifySpreadsheet } from '@/lib/sheets-api'

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token?: string; error?: string; expires_in?: number }) => void
          }) => { requestAccessToken: () => void }
        }
      }
    }
  }
}

export function useSheets() {
  const [token, setToken] = useState<GoogleToken | null>(null)
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.GOOGLE_TOKEN)
    const storedId = localStorage.getItem(STORAGE_KEYS.SPREADSHEET_ID)

    if (storedToken) {
      try {
        const parsed: GoogleToken = JSON.parse(storedToken)
        if (isTokenValid(parsed)) {
          setToken(parsed)
        } else {
          localStorage.removeItem(STORAGE_KEYS.GOOGLE_TOKEN)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEYS.GOOGLE_TOKEN)
      }
    }

    if (storedId) {
      setSpreadsheetId(storedId)
    }
  }, [])

  useEffect(() => {
    if (token && spreadsheetId) {
      verifySpreadsheet(token.access_token, spreadsheetId)
        .then(ok => setVerified(ok))
        .catch(() => setVerified(false))
    }
  }, [token, spreadsheetId])

  const requestToken = useCallback((): Promise<GoogleToken> => {
    return new Promise((resolve, reject) => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!clientId) {
        reject(new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID no configurado'))
        return
      }

      if (!window.google) {
        reject(new Error('Google Identity Services no cargado'))
        return
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.file',
        ].join(' '),
        callback: (response) => {
          if (response.error) {
            reject(new Error(response.error))
            return
          }
          if (response.access_token) {
            const t: GoogleToken = {
              access_token: response.access_token,
              expires_at: Date.now() + (response.expires_in || 3600) * 1000,
            }
            localStorage.setItem(STORAGE_KEYS.GOOGLE_TOKEN, JSON.stringify(t))
            setToken(t)
            resolve(t)
          }
        },
      })
      client.requestAccessToken()
    })
  }, [])

  const getValidToken = useCallback(async (): Promise<string> => {
    if (token && isTokenValid(token)) return token.access_token
    const newToken = await requestToken()
    return newToken.access_token
  }, [token, requestToken])

  const connectSheets = useCallback(async (id: string) => {
    setConnecting(true)
    try {
      const accessToken = await getValidToken()
      const ok = await verifySpreadsheet(accessToken, id)
      if (!ok) throw new Error('No se pudo acceder a la hoja')
      localStorage.setItem(STORAGE_KEYS.SPREADSHEET_ID, id)
      setSpreadsheetId(id)
      setVerified(true)
    } finally {
      setConnecting(false)
    }
  }, [getValidToken])

  const setNewSpreadsheetId = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEYS.SPREADSHEET_ID, id)
    setSpreadsheetId(id)
  }, [])

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.GOOGLE_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.SPREADSHEET_ID)
    setToken(null)
    setSpreadsheetId(null)
    setVerified(false)
  }, [])

  return {
    token,
    spreadsheetId,
    connecting,
    verified,
    isConnected: !!(token && spreadsheetId && verified),
    getValidToken,
    requestToken,
    connectSheets,
    setNewSpreadsheetId,
    disconnect,
  }
}
