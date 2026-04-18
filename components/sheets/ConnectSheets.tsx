'use client'
import { useState } from 'react'
import { Link2, Plus, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createSpreadsheet } from '@/lib/sheets-api'

interface ConnectSheetsProps {
  onConnect: (id: string) => void
  onNew: (id: string) => void
  getValidToken: () => Promise<string>
  connecting: boolean
}

export function ConnectSheets({ onConnect, onNew, getValidToken, connecting }: ConnectSheetsProps) {
  const [mode, setMode] = useState<'select' | 'existing' | 'new' | null>(null)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('Finanzas Personales')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function extractId(input: string): string | null {
    const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (match) return match[1]
    if (/^[a-zA-Z0-9-_]{20,}$/.test(input.trim())) return input.trim()
    return null
  }

  async function handleConnect() {
    const id = extractId(url)
    if (!id) {
      setError('URL o ID inválido')
      return
    }
    setError('')
    setLoading(true)
    try {
      await onConnect(id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al conectar')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      const token = await getValidToken()
      const id = await createSpreadsheet(token, title)
      onNew(id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear la hoja')
    } finally {
      setLoading(false)
    }
  }

  if (mode === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="w-12 h-12 bg-background border border-border rounded-lg flex items-center justify-center mb-6">
          <FileSpreadsheet className="w-6 h-6 text-text-secondary" />
        </div>
        <h2 className="font-sans font-semibold text-text-primary text-lg mb-2">
          Conecta tu Google Sheet
        </h2>
        <p className="text-sm text-text-secondary mb-8 max-w-sm">
          Tus datos se guardan directamente en Google Sheets. Elige si quieres crear una hoja nueva o conectar una existente.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            onClick={() => setMode('new')}
          >
            <Plus className="w-4 h-4" />
            Crear hoja nueva
          </Button>
          <Button
            variant="secondary"
            onClick={() => setMode('existing')}
          >
            <Link2 className="w-4 h-4" />
            Conectar existente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="w-full max-w-md">
        <button
          onClick={() => { setMode(null); setError('') }}
          className="text-xs text-text-muted hover:text-text-secondary mb-6 flex items-center gap-1 transition-colors"
        >
          ← Volver
        </button>

        {mode === 'existing' ? (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-sans font-semibold text-text-primary mb-1">Conectar hoja existente</h3>
              <p className="text-sm text-text-secondary">Pega la URL o el ID de tu Google Sheet</p>
            </div>
            <Input
              label="URL o ID de la hoja"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              error={error}
            />
            <Button loading={loading || connecting} onClick={handleConnect}>
              <Link2 className="w-4 h-4" />
              Conectar
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-sans font-semibold text-text-primary mb-1">Crear hoja nueva</h3>
              <p className="text-sm text-text-secondary">Se creará en tu Google Drive con la estructura lista</p>
            </div>
            <Input
              label="Nombre de la hoja"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Finanzas Personales"
            />
            {error && <p className="text-xs text-expense">{error}</p>}
            <Button loading={loading || connecting} onClick={handleCreate}>
              <Plus className="w-4 h-4" />
              Crear y conectar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
