import { Category } from './types'

export const CATEGORIES: Category[] = [
  { nombre: 'Vivienda', tipo: 'gasto' },
  { nombre: 'Transporte', tipo: 'gasto' },
  { nombre: 'Alimentación', tipo: 'gasto' },
  { nombre: 'Servicios', tipo: 'gasto' },
  { nombre: 'Salud', tipo: 'gasto' },
  { nombre: 'Educación', tipo: 'gasto' },
  { nombre: 'Entretenimiento', tipo: 'gasto' },
  { nombre: 'Ropa', tipo: 'gasto' },
  { nombre: 'Suscripciones', tipo: 'gasto' },
  { nombre: 'Otros gastos', tipo: 'gasto' },
  { nombre: 'Salario', tipo: 'ingreso' },
  { nombre: 'Freelance', tipo: 'ingreso' },
  { nombre: 'Inversiones', tipo: 'ingreso' },
  { nombre: 'Regalos', tipo: 'ingreso' },
  { nombre: 'Otros ingresos', tipo: 'ingreso' },
]

export const PAYMENT_METHODS = [
  'Efectivo',
  'Tarjeta débito',
  'Tarjeta crédito',
  'Transferencia',
]

export const APP_CREDENTIALS = {
  username: 'trazeure',
  password: '291169',
}

export const STORAGE_KEYS = {
  APP_AUTH: 'fin_app_auth',
  GOOGLE_TOKEN: 'fin_google_token',
  SPREADSHEET_ID: 'fin_spreadsheet_id',
}

export const SHEETS = {
  TRANSACTIONS: 'Transacciones',
  CONFIG: 'Configuración',
  CATEGORIES: 'Categorías',
}

export const TRANSACTION_HEADERS = [
  'ID',
  'Fecha',
  'Tipo',
  'Categoría',
  'Descripción',
  'Monto',
  'Método de pago',
]

export const CONFIG_DEFAULTS = {
  salarioMensual: 0,
  metaAhorro: 20,
  moneda: 'MXN',
}
