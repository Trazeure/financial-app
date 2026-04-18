'use client'
import { useState, useEffect } from 'react'
import { Save, ExternalLink, LogOut } from 'lucide-react'
import { useApp } from '../layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { GoogleSignIn } from '@/components/sheets/GoogleSignIn'
import { useToast } from '@/components/ui/Toast'
import { Config } from '@/lib/types'

const SPREADSHEET_ID = '1PCxDaEqNQfHBPkOnx9TMK0qTkEsJaHHTGgY58Dyd544'

export default function SettingsPage() {
  const { config, updateConfig, isConnected, signIn, disconnect, sheetsConnecting } = useApp()
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
      await updateConfig({
        salarioMensual: parseFloat(salario) || 0,
        metaAhorro: parseFloat(meta) || 20,
        moneda,
      } as Config)
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
        <p className="text-sm text-text-muted mt-0.5">Parámetros financieros</p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Parámetros financieros</h2>
          <div className="flex flex-col gap-4">
            <Input label="Salario mensual" type="number" min="0" value={salario} onChange={e => setSalario(e.target.value)} placeholder="0.00" />
            <Input label="Meta de ahorro (%)" type="number" min="0" max="100" value={meta} onChange={e => setMeta(e.target.value)} placeholder="20" />
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
          <p className="text-xs text-text-muted mb-4">Tu hoja de datos conectada</p>

          {isConnected ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 p-3 bg-income-light border border-income/20 rounded">
                <div className="w-2 h-2 rounded-full bg-income shrink-0" />
                <p className="text-xs text-income font-medium">Sesión de Google activa</p>
              </div>
              <a
                href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-text-secondary hover:text-balance transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir en Google Sheets
              </a>
              <Button variant="secondary" size="sm" onClick={disconnect}>
                <LogOut className="w-3.5 h-3.5" />
                Cerrar sesión de Google
              </Button>
            </div>
          ) : (
            <GoogleSignIn
              onSignIn={async () => {
                try { await signIn() }
                catch (e) { toast('error', e instanceof Error ? e.message : 'Error') }
              }}
              loading={sheetsConnecting}
            />
          )}
        </div>
      </div>
    </div>
  )
}
