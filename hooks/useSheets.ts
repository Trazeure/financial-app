'use client'
import { useState, useEffect, useCallback } from 'react'
import { GoogleToken } from '@/lib/types'
import { STORAGE_KEYS } from '@/lib/constants'
import { isTokenValid } from '@/lib/sheets-api'

const GOOGLE_CLIENT_ID = '598402271564-9ubbmf7biorg0pbm761anvo1h1gqtp10.apps.googleusercontent.com'
const SPREADSHEET_ID = '1PCxDaEqNQfHBPkOnx9TMK0qTkEsJaHHTGgY58Dyd544'

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
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SPREADSHEET_ID, SPREADSHEET_ID)
    const storedToken = localStorage.getItem(STORAGE_KEYS.GOOGLE_TOKEN)
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
  }, [])

  const requestToken = useCallback((): Promise<GoogleToken> => {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Identity Services no cargado. Recarga la página.'))
        return
      }
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
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

  const signIn = useCallback(async () => {
    setConnecting(true)
    try {
      await requestToken()
    } finally {
      setConnecting(false)
    }
  }, [requestToken])

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.GOOGLE_TOKEN)
    setToken(null)
  }, [])

  return {
    token,
    spreadsheetId: SPREADSHEET_ID,
    connecting,
    isConnected: !!(token && isTokenValid(token)),
    getValidToken,
    requestToken,
    signIn,
    disconnect,
  }
}
