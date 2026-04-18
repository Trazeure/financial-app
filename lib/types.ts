export type TransactionType = 'ingreso' | 'gasto'

export type PaymentMethod =
  | 'Efectivo'
  | 'Tarjeta débito'
  | 'Tarjeta crédito'
  | 'Transferencia'

export interface Transaction {
  id: string
  fecha: string
  tipo: TransactionType
  categoria: string
  descripcion: string
  monto: number
  metodoPago: PaymentMethod
}

export interface Config {
  salarioMensual: number
  metaAhorro: number
  moneda: string
}

export interface Category {
  nombre: string
  tipo: TransactionType | 'ambos'
}

export interface GoogleToken {
  access_token: string
  expires_at: number
}

export interface MonthlyData {
  month: string
  ingresos: number
  gastos: number
  balance: number
}

export interface CategoryTotal {
  categoria: string
  total: number
  porcentaje: number
}
