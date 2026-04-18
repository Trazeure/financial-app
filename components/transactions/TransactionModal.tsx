'use client'
import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Transaction, TransactionType } from '@/lib/types'
import { CATEGORIES, PAYMENT_METHODS } from '@/lib/constants'
import { clsx } from 'clsx'

interface TransactionModalProps {
  open: boolean
  onClose: () => void
  onSave: (t: Omit<Transaction, 'id'>) => Promise<void>
  onUpdate?: (t: Transaction) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  initial?: Transaction | null
}

const today = () => new Date().toISOString().split('T')[0]

export function TransactionModal({
  open,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  initial,
}: TransactionModalProps) {
  const [tipo, setTipo] = useState<TransactionType>('gasto')
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(today())
  const [metodoPago, setMetodoPago] = useState<Transaction['metodoPago']>('Efectivo')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = !!initial

  useEffect(() => {
    if (open) {
      if (initial) {
        setTipo(initial.tipo)
        setMonto(String(initial.monto))
        setCategoria(initial.categoria)
        setDescripcion(initial.descripcion)
        setFecha(initial.fecha)
        setMetodoPago(initial.metodoPago)
      } else {
        setTipo('gasto')
        setMonto('')
        setCategoria('')
        setDescripcion('')
        setFecha(today())
        setMetodoPago('Efectivo')
      }
      setErrors({})
    }
  }, [open, initial])

  const categoriasFiltradas = CATEGORIES.filter(c => c.tipo === tipo || c.tipo === 'ambos')

  function validate() {
    const e: Record<string, string> = {}
    if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) e.monto = 'Monto inválido'
    if (!categoria) e.categoria = 'Selecciona una categoría'
    if (!fecha) e.fecha = 'Fecha requerida'
    return e
  }

  async function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try {
      const data = {
        tipo,
        monto: parseFloat(monto),
        categoria,
        descripcion,
        fecha,
        metodoPago,
      }
      if (isEdit && initial && onUpdate) {
        await onUpdate({ ...data, id: initial.id })
      } else {
        await onSave(data)
      }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!initial || !onDelete) return
    setLoading(true)
    try {
      await onDelete(initial.id)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar transacción' : 'Nueva transacción'}
    >
      <div className="flex flex-col gap-4">
        <div className="flex rounded overflow-hidden border border-border">
          {(['gasto', 'ingreso'] as TransactionType[]).map(t => (
            <button
              key={t}
              onClick={() => { setTipo(t); setCategoria('') }}
              className={clsx(
                'flex-1 py-2 text-sm font-medium transition-all duration-200',
                tipo === t
                  ? t === 'gasto'
                    ? 'bg-expense text-white'
                    : 'bg-income text-white'
                  : 'bg-background text-text-secondary hover:text-text-primary'
              )}
            >
              {t === 'gasto' ? 'Gasto' : 'Ingreso'}
            </button>
          ))}
        </div>

        <Input
          label="Monto"
          type="number"
          min="0"
          step="0.01"
          value={monto}
          onChange={e => setMonto(e.target.value)}
          placeholder="0.00"
          error={errors.monto}
        />

        <Select
          label="Categoría"
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          error={errors.categoria}
          options={[
            { value: '', label: 'Selecciona una categoría' },
            ...categoriasFiltradas.map(c => ({ value: c.nombre, label: c.nombre })),
          ]}
        />

        <Input
          label="Descripción"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Descripción opcional"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Fecha"
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            error={errors.fecha}
          />
          <Select
            label="Método de pago"
            value={metodoPago}
            onChange={e => setMetodoPago(e.target.value as Transaction['metodoPago'])}
            options={PAYMENT_METHODS.map(m => ({ value: m, label: m }))}
          />
        </div>

        <div className="flex gap-2 pt-2">
          {isEdit && (
            <Button variant="danger" size="sm" loading={loading} onClick={handleDelete}>
              Eliminar
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button loading={loading} onClick={handleSave}>
              {isEdit ? 'Guardar cambios' : 'Agregar'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
