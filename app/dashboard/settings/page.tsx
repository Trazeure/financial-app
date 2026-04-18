'use client'
import { useState, useEffect } from 'react'
import { Save, Link2Off, ExternalLink } from 'lucide-react'
import { useApp } from '../layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ConnectSheets } from '@/components/sheets/ConnectSheets'
import { useToast } from '@/components/ui/Toast'
import { Config } from '@/lib/types'

export default function SettingsPage() {
  const {
    config, updateConfig, isConnected, spreadsheetId,
    getValidToken, connectSheets, setNewSpreadsheetId,
    sheetsConnecting, disconnect,
  } = useApp()
  const toast = useToast()

  const [salario, setSalario] = useState('')
  const [meta, setMeta] = useState('')
  const [moneda, setMoneda] = useState('MXN')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSalario(String(config.salarioMensual || ''))
    setMeta(String(config.metaAhorro || ''))
    setMoneda(config.moneda || 'MXN')
  }, [config])

  async function handleSave() {
    setSaving(true)
    try {
      const newConfig: Config = {
        salarioMensual: parseFloat(salario) || 0,
        metaAhorro: parseFloat(meta) || 20,
        moneda,
      }
      await updateConfig(newConfig)
      toast('success', 'Configuración guardada')
    } catch {
      toast('error', 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-6 py-7 max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="font-serif italic text-2xl text-text-primary">Configuración</h1>
        <p className="text-sm text-text-muted mt-0.5">Ajusta tus parámetros financieros</p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Parámetros financieros</h2>
          <div className="flex flex-col gap-4">
            <Input
              label="Salario mensual"
              type="number"
              min="0"
              value={salario}
              onChange={e => setSalario(e.target.value)}
              placeholder="0.00"
            />
            <Input
              label="Meta de ahorro (%)"
              type="number"
              min="0"
              max="100"
              value={meta}
              onChange={e => setMeta(e.target.value)}
              placeholder="20"
            />
            <Select
              label="Moneda"
              value={moneda}
              onChange={e => setMoneda(e.target.value)}
              options={[
                { value: 'MXN', label: 'MXN — Peso mexicano' },
                { value: 'USD', label: 'USD — Dólar americano' },
                { value: 'EUR', label: 'EUR — Euro' },
                { value: 'COP', label: 'COP — Peso colombiano' },
                { value: 'ARS', label: 'ARS — Peso argentino' },
              ]}
            />
          </div>
          <div className="mt-5">
            <Button loading={saving} onClick={handleSave} disabled={!isConnected}>
              <Save className="w-4 h-4" />
              Guardar cambios
            </Button>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-1">Google Sheets</h2>
          <p className="text-xs text-text-muted mb-4">Fuente de datos conectada</p>

          {isConnected ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 p-3 bg-income-light border border-income/20 rounded">
                <div className="w-2 h-2 rounded-full bg-income shrink-0" />
                <p className="text-xs text-income font-medium">Conectado</p>
              </div>
              {spreadsheetId && (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-text-secondary hover:text-balance transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir en Google Sheets
                </a>
              )}
              <Button variant="secondary" size="sm" onClick={disconnect}>
                <Link2Off className="w-3.5 h-3.5" />
                Desconectar
              </Button>
            </div>
          ) : (
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
          )}
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-1">Configurar Google OAuth</h2>
          <p className="text-xs text-text-muted mb-4">
            Para conectar Google Sheets necesitas un Client ID de Google Cloud.
          </p>
          <ol className="flex flex-col gap-2 text-xs text-text-secondary list-decimal list-inside">
            <li>Ve a <span className="font-medium text-text-primary">console.cloud.google.com</span></li>
            <li>Crea un proyecto o selecciona uno existente</li>
            <li>Habilita <span className="font-medium text-text-primary">Google Sheets API</span> y <span className="font-medium text-text-primary">Google Drive API</span></li>
            <li>En Credenciales, crea un <span className="font-medium text-text-primary">OAuth 2.0 Client ID</span> (tipo: Web application)</li>
            <li>Agrega tu dominio en <span className="font-medium text-text-primary">Authorized JavaScript origins</span></li>
            <li>Copia el Client ID y agrégalo como <span className="font-mono text-balance">NEXT_PUBLIC_GOOGLE_CLIENT_ID</span> en tu archivo .env.local</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
