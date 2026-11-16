export type Register = 'sales' | 'purchases'
export type VatRate = '23%' | '8%' | '5%' | '0%' | 'np'
export type KsefStatus = 'pending' | 'confirmed'

export interface VatDocument {
  id: string
  register: Register
  contractor: string
  nip: string
  issueDate: string // ISO yyyy-mm-dd
  saleDate: string
  number: string
  series: string
  ksef: { status: KsefStatus; number?: string }
  identifier: string
  operation: string
  jpkCode: string
  rate: VatRate
  net: number
}

export const RATE_VALUE: Record<VatRate, number> = {
  '23%': 0.23,
  '8%': 0.08,
  '5%': 0.05,
  '0%': 0,
  np: 0,
}

export const RATES: VatRate[] = ['23%', '8%', '5%', '0%', 'np']

export const vatOf = (d: VatDocument) => Math.round(d.net * RATE_VALUE[d.rate] * 100) / 100
export const grossOf = (d: VatDocument) => Math.round((d.net + vatOf(d)) * 100) / 100

export const OPERATIONS: Record<Register, string[]> = {
  sales: ['Sprzedaż krajowa', 'Eksport usług', 'WDT'],
  purchases: ['Zakup krajowy', 'Import usług', 'Nabycie środka trwałego'],
}

export const JPK_CODES = ['Brak', 'GTU_12', 'GTU_13', 'TP', 'MPP']

const pad = (n: number) => String(n).padStart(2, '0')

type Seed = [month: number, day: number, net: number, rate: VatRate, op: number, jpk: string, correction?: boolean]

const SALES: Seed[] = [
  [10, 1, 800, '23%', 0, 'Brak'],
  [10, 2, 650, '23%', 0, 'GTU_12'],
  [10, 3, -150, '23%', 0, 'Brak', true],
  [10, 4, 1200, '23%', 0, 'GTU_12'],
  [10, 5, 900, '23%', 0, 'Brak'],
  [10, 6, 700, 'np', 1, 'Brak'],
  [10, 7, 1100, '23%', 0, 'TP'],
  [10, 8, 450, '23%', 0, 'Brak'],
  [10, 9, 600, '8%', 0, 'GTU_13'],
  [10, 10, 1000, '23%', 0, 'MPP'],
  [10, 11, 350, '23%', 0, 'Brak'],
  [10, 12, 500, '0%', 2, 'Brak'],
  [10, 13, 1000, '23%', 0, 'GTU_12'],
  [10, 14, 600, '23%', 0, 'Brak'],
  [9, 4, 1500, '23%', 0, 'Brak'],
  [9, 11, 400, '8%', 0, 'GTU_13'],
  [9, 18, 2100, '23%', 0, 'MPP'],
  [9, 25, 300, 'np', 1, 'Brak'],
]

const PURCHASES: Seed[] = [
  [10, 2, 420, '23%', 0, 'Brak'],
  [10, 5, 1300, '23%', 2, 'Brak'],
  [10, 7, 260, '8%', 0, 'Brak'],
  [10, 9, 900, 'np', 1, 'Brak'],
  [10, 12, 150, '23%', 0, 'MPP'],
  [10, 15, 780, '23%', 0, 'Brak'],
  [10, 19, 95, '5%', 0, 'Brak'],
  [10, 22, 2400, '23%', 2, 'Brak'],
  [10, 28, 330, '23%', 0, 'TP'],
  [9, 8, 610, '23%', 0, 'Brak'],
  [9, 21, 1200, '23%', 1, 'Brak'],
]

function build(register: Register, seeds: Seed[]): VatDocument[] {
  const isSale = register === 'sales'
  const counters: Record<number, number> = {}
  return seeds.map(([month, day, net, rate, op, jpk, correction], i) => {
    counters[month] = (counters[month] ?? 0) + 1
    const n = counters[month]
    const series = isSale ? (correction ? 'KOR' : 'FV') : 'FZ'
    const date = `2026-${pad(month)}-${pad(day)}`
    const confirmed = !isSale && i % 3 === 0
    return {
      id: `${register}-${i + 1}`,
      register,
      contractor: `Demo ${isSale ? 'Alfa' : 'Beta'} ${pad(i + 1)}`,
      nip: `52600${pad(i + 11)}${isSale ? '471' : '983'}`,
      issueDate: date,
      saleDate: date,
      number: `${series}/${n}/${pad(month)}/2026/DEMO`,
      series,
      ksef: confirmed
        ? { status: 'confirmed', number: `5260250274-202610${pad(day)}-${(4096 + i * 977).toString(16).toUpperCase()}A1-${pad(i)}` }
        : { status: 'pending' },
      identifier: `DEMO-${isSale ? 'S' : 'Z'}-${i + 1}`,
      operation: OPERATIONS[register][op],
      jpkCode: jpk,
      rate,
      net,
    }
  })
}

export const DOCUMENTS: VatDocument[] = [...build('sales', SALES), ...build('purchases', PURCHASES)]

/** Simulates a network call so loading / error states are realistic. */
export function fetchDocuments(fail = false, delay = 650): Promise<VatDocument[]> {
  return new Promise((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error('Network error')) : resolve(DOCUMENTS)), delay),
  )
}
