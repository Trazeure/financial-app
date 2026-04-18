import { Transaction, Config, GoogleToken } from './types'
import { SHEETS, TRANSACTION_HEADERS, CONFIG_DEFAULTS, CATEGORIES } from './constants'
import { generateId } from './utils'

const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets'

// Only encode the sheet name, NOT the cell range notation (A:G, A1:B3, etc.)
function encodeRange(range: string): string {
  const bang = range.indexOf('!')
  if (bang === -1) return range
  return encodeURIComponent(range.substring(0, bang)) + '!' + range.substring(bang + 1)
}

async function request<T>(url: string, options: RequestInit, retries = 3): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, options)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `HTTP ${res.status}`)
      }
      return res.json()
    } catch (e) {
      if (attempt === retries - 1) throw e
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export async function getTransactions(token: string, id: string): Promise<Transaction[]> {
  const res = await request<{ values?: string[][] }>(
    `${BASE_URL}/${id}/values/${encodeRange(SHEETS.TRANSACTIONS + '!A2:G')}`,
    { method: 'GET', headers: authHeaders(token) }
  )
  if (!res.values) return []
  return res.values
    .filter(row => row[0])
    .map(row => ({
      id: row[0] || '',
      fecha: row[1] || '',
      tipo: (row[2] || 'gasto') as Transaction['tipo'],
      categoria: row[3] || '',
      descripcion: row[4] || '',
      monto: parseFloat(row[5]) || 0,
      metodoPago: (row[6] || 'Efectivo') as Transaction['metodoPago'],
    }))
}

export async function addTransaction(token: string, id: string, t: Omit<Transaction, 'id'>): Promise<Transaction> {
  const newId = generateId()
  const row = [newId, t.fecha, t.tipo, t.categoria, t.descripcion, t.monto, t.metodoPago]
  const range = encodeRange(SHEETS.TRANSACTIONS + '!A:G')
  await request(
    `${BASE_URL}/${id}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    { method: 'POST', headers: authHeaders(token), body: JSON.stringify({ values: [row] }) }
  )
  return { id: newId, ...t }
}

export async function updateTransaction(
  token: string,
  txId: string,
  spreadsheetId: string,
  transactions: Transaction[],
  updated: Transaction
): Promise<void> {
  const rowIndex = transactions.findIndex(t => t.id === txId) + 2
  const row = [updated.id, updated.fecha, updated.tipo, updated.categoria, updated.descripcion, updated.monto, updated.metodoPago]
  const range = encodeRange(`${SHEETS.TRANSACTIONS}!A${rowIndex}:G${rowIndex}`)
  await request(
    `${BASE_URL}/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
    { method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ values: [row] }) }
  )
}

export async function deleteTransaction(
  token: string,
  txId: string,
  spreadsheetId: string,
  transactions: Transaction[]
): Promise<void> {
  const rowIndex = transactions.findIndex(t => t.id === txId) + 2
  const range = encodeRange(`${SHEETS.TRANSACTIONS}!A${rowIndex}:G${rowIndex}`)
  await request(
    `${BASE_URL}/${spreadsheetId}/values/${range}:clear`,
    { method: 'POST', headers: authHeaders(token), body: JSON.stringify({}) }
  )
}

export async function getConfig(token: string, id: string): Promise<Config> {
  const res = await request<{ values?: string[][] }>(
    `${BASE_URL}/${id}/values/${encodeRange(SHEETS.CONFIG + '!A1:B3')}`,
    { method: 'GET', headers: authHeaders(token) }
  )
  const map: Record<string, string> = {}
  if (res.values) res.values.forEach(row => { if (row[0]) map[row[0]] = row[1] || '' })
  return {
    salarioMensual: parseFloat(map.salarioMensual) || 0,
    metaAhorro: parseFloat(map.metaAhorro) || 20,
    moneda: map.moneda || 'MXN',
  }
}

export async function saveConfig(token: string, id: string, config: Config): Promise<void> {
  const values = [
    ['salarioMensual', config.salarioMensual],
    ['metaAhorro', config.metaAhorro],
    ['moneda', config.moneda],
  ]
  await request(
    `${BASE_URL}/${id}/values/${encodeRange(SHEETS.CONFIG + '!A1:B3')}?valueInputOption=USER_ENTERED`,
    { method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ values }) }
  )
}

export async function initializeSheetIfNeeded(token: string, id: string): Promise<void> {
  const res = await request<{ sheets: { properties: { title: string } }[] }>(
    `${BASE_URL}/${id}?fields=sheets.properties.title`,
    { method: 'GET', headers: authHeaders(token) }
  )

  const existing = res.sheets.map(s => s.properties.title)
  const needed = [SHEETS.TRANSACTIONS, SHEETS.CONFIG, SHEETS.CATEGORIES].filter(t => !existing.includes(t))

  if (needed.length > 0) {
    await request(`${BASE_URL}/${id}:batchUpdate`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ requests: needed.map(title => ({ addSheet: { properties: { title } } })) }),
    })
  }

  const [txCheck, cfgCheck] = await Promise.all([
    request<{ values?: string[][] }>(`${BASE_URL}/${id}/values/${encodeRange(SHEETS.TRANSACTIONS + '!A1:G1')}`, { method: 'GET', headers: authHeaders(token) }),
    request<{ values?: string[][] }>(`${BASE_URL}/${id}/values/${encodeRange(SHEETS.CONFIG + '!A1:B1')}`, { method: 'GET', headers: authHeaders(token) }),
  ])

  const writes: { range: string; values: (string | number)[][] }[] = []
  if (!txCheck.values?.length) writes.push({ range: `${SHEETS.TRANSACTIONS}!A1`, values: [TRANSACTION_HEADERS] })
  if (!cfgCheck.values?.length) writes.push({
    range: `${SHEETS.CONFIG}!A1`,
    values: [['salarioMensual', CONFIG_DEFAULTS.salarioMensual], ['metaAhorro', CONFIG_DEFAULTS.metaAhorro], ['moneda', CONFIG_DEFAULTS.moneda]],
  })

  for (const w of writes) {
    await request(
      `${BASE_URL}/${id}/values/${encodeRange(w.range)}?valueInputOption=USER_ENTERED`,
      { method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ values: w.values }) }
    )
  }
}

export async function verifySpreadsheet(token: string, id: string): Promise<boolean> {
  try {
    await request<unknown>(`${BASE_URL}/${id}?fields=spreadsheetId`, { method: 'GET', headers: authHeaders(token) })
    return true
  } catch { return false }
}

export function isTokenValid(t: GoogleToken): boolean {
  return t.expires_at > Date.now() + 60_000
}
