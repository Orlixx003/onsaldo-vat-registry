import { useCallback, useEffect, useMemo, useState } from 'react'
import { Info, ShoppingCart, Store } from 'lucide-react'
import { fetchDocuments, grossOf, vatOf, type Register, type VatDocument } from '../data/demo'
import { MONTHS, MONTHS_IN, plural } from '../lib/format'
import { useMediaQuery } from '../lib/hooks'
import { DocumentList, type Sort, type SortKey } from './DocumentList'
import { Pagination } from './Pagination'
import { PeriodPicker } from './PeriodPicker'
import { Popover } from './Popover'
import { RetryButton, Skeleton, StateView } from './States'
import { Summary } from './Summary'
import { DEFAULT_COLUMNS, EMPTY_FILTERS, Toolbar, activeFilterCount, type Column, type Filters } from './Toolbar'

export type DemoState = 'data' | 'empty' | 'error'
type Load = { status: 'loading' } | { status: 'error' } | { status: 'ready'; docs: VatDocument[] }

interface Props {
  demo: DemoState
  onDemo: (s: DemoState) => void
  notify: (msg: string) => void
}

const REGISTERS: { key: Register; label: string; icon: typeof Store }[] = [
  { key: 'sales', label: 'Sprzedaż', icon: Store },
  { key: 'purchases', label: 'Zakupy', icon: ShoppingCart },
]

export function RegistryPage({ demo, onDemo, notify }: Props) {
  const compact = useMediaQuery('(max-width: 860px)')

  const [load, setLoad] = useState<Load>({ status: 'loading' })
  const [register, setRegister] = useState<Register>('sales')
  const [period, setPeriod] = useState({ year: 2026, month: 9 })
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS)
  const [sort, setSort] = useState<Sort>({ key: 'date', dir: 'asc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [infoOpen, setInfoOpen] = useState(false)

  const fetchData = useCallback((fail: boolean) => {
    setLoad({ status: 'loading' })
    fetchDocuments(fail)
      .then((docs) => setLoad({ status: 'ready', docs }))
      .catch(() => setLoad({ status: 'error' }))
  }, [])

  // (Re)load whenever the demo switcher changes the scenario.
  useEffect(() => fetchData(demo === 'error'), [demo, fetchData])

  // Any change to the data slice resets paging and opened rows.
  useEffect(() => { setPage(1); setExpanded(new Set()) }, [register, period, query, filters, pageSize])

  const all = load.status === 'ready' && demo !== 'empty' ? load.docs : []

  const inPeriod = useMemo(() => {
    const prefix = `${period.year}-${String(period.month + 1).padStart(2, '0')}`
    return all.filter((d) => d.issueDate.startsWith(prefix))
  }, [all, period])

  const counts = {
    sales: inPeriod.filter((d) => d.register === 'sales').length,
    purchases: inPeriod.filter((d) => d.register === 'purchases').length,
  }
  const inRegister = inPeriod.filter((d) => d.register === register)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return inRegister.filter((d) =>
      (filters.operation === 'all' || d.operation === filters.operation) &&
      (filters.jpk === 'all' || d.jpkCode === filters.jpk) &&
      (filters.series.length === 0 || filters.series.includes(d.series)) &&
      (!q || [d.contractor, d.number, d.identifier, d.nip, d.ksef.number ?? ''].some((v) => v.toLowerCase().includes(q))),
    )
  }, [inRegister, query, filters])

  const sorted = useMemo(() => {
    const val = (d: VatDocument): string | number => {
      switch (sort.key) {
        case 'contractor': return d.contractor
        case 'date': return d.issueDate
        case 'number': return d.number
        case 'identifier': return Number(d.identifier.split('-').pop())
        case 'gross': return grossOf(d)
      }
    }
    const k = sort.dir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => (val(a) > val(b) ? k : val(a) < val(b) ? -k : 0))
  }, [filtered, sort])

  const pageDocs = sorted.slice((page - 1) * pageSize, page * pageSize)
  const filterCount = activeFilterCount(filters)
  const narrowed = Boolean(query.trim()) || filterCount > 0
  const periodLabel = `${MONTHS_IN[period.month]} ${period.year}`
  const registerLabel = register === 'sales' ? 'sprzedaży' : 'zakupów'

  const onSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  const toggleRow = (id: string) =>
    setExpanded((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const resetNarrowing = () => { setQuery(''); setFilters(EMPTY_FILTERS) }

  const exportCsv = () => {
    const head = ['Kontrahent', 'NIP', 'Data', 'Numer dokumentu', 'Numer KSeF', 'Identyfikator', 'Rodzaj operacji', 'Kod JPK V7', 'Stawka', 'Netto', 'VAT', 'Brutto']
    const lines = sorted.map((d) => [d.contractor, d.nip, d.issueDate, d.number, d.ksef.number ?? 'Brak potwierdzenia', d.identifier, d.operation, d.jpkCode, d.rate, d.net, vatOf(d), grossOf(d)])
    const csv = [head, ...lines].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `rejestr-${register}-${period.year}-${period.month + 1}.csv` })
    a.click()
    URL.revokeObjectURL(url)
    notify(`Wyeksportowano ${sorted.length} ${plural(sorted.length, 'dokument', 'dokumenty', 'dokumentów')}`)
  }

  const isLoading = load.status === 'loading'
  const isError = load.status === 'error'

  return (
    <main className="page">
      <div className="page__head">
        <div>
          <h1>Rejestry i VAT</h1>
          <p className="muted">Sprzedaż i zakupy w wybranym okresie</p>
        </div>
        <div className="page__status">
          <Popover
            open={infoOpen}
            onClose={() => setInfoOpen(false)}
            align="end"
            width={300}
            trigger={
              <button className="pill pill--warn" onClick={() => setInfoOpen(!infoOpen)} aria-expanded={infoOpen}>
                <Info size={14} /> Wymaga potwierdzenia
              </button>
            }
          >
            <div className="note">
              <strong>Kontekst VAT wymaga potwierdzenia</strong>
              <p>Poniżej wyłącznie dane demonstracyjne, nie ewidencja organizacji.</p>
            </div>
          </Popover>
          <span className="pill" title="Dane demonstracyjne">DEMO</span>
        </div>
      </div>

      <div className="controls">
        <div className="seg" role="tablist" aria-label="Rejestr">
          {REGISTERS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={register === key}
              className={register === key ? 'is-active' : ''}
              onClick={() => { setRegister(key); setFilters(EMPTY_FILTERS) }}
            >
              <Icon size={16} /> {label}
              {load.status === 'ready' && <span className="seg__count">{counts[key]}</span>}
            </button>
          ))}
        </div>
        <PeriodPicker year={period.year} month={period.month} onChange={(year, month) => setPeriod({ year, month })} />
      </div>

      {isLoading && (
        <section className="summary card" aria-hidden>
          <div className="summary__kpis">
            {[0, 1, 2].map((i) => <div key={i} className="kpi"><span className="sk sk--sm" /><span className="sk sk--lg" /></div>)}
          </div>
        </section>
      )}
      {load.status === 'ready' && <Summary docs={filtered} />}

      <section className="card list" aria-label={`Rejestr VAT ${registerLabel}`}>
        <Toolbar
          register={register}
          query={query}
          onQuery={setQuery}
          filters={filters}
          onFilters={setFilters}
          columns={columns}
          onColumns={setColumns}
          resultCount={filtered.length}
          disabled={!(load.status === 'ready')}
          onExport={exportCsv}
          onPrint={() => window.print()}
          onTags={() => notify('Etykiety dokumentów — dostępne po potwierdzeniu kontekstu VAT')}
        />

        {filterCount > 0 && (
          <div className="active-filters">
            {filters.operation !== 'all' && <FilterChip label={filters.operation} onRemove={() => setFilters({ ...filters, operation: 'all' })} />}
            {filters.jpk !== 'all' && <FilterChip label={`JPK: ${filters.jpk}`} onRemove={() => setFilters({ ...filters, jpk: 'all' })} />}
            {filters.series.length > 0 && <FilterChip label={`Seria: ${filters.series.join(', ')}`} onRemove={() => setFilters({ ...filters, series: [] })} />}
            <button className="link" onClick={() => setFilters(EMPTY_FILTERS)}>Wyczyść wszystko</button>
          </div>
        )}

        {isLoading && <Skeleton rows={compact ? 4 : 8} />}

        {isError && (
          <StateView
            kind="error"
            title="Nie udało się wczytać rejestru"
            text="Sprawdź połączenie i spróbuj ponownie. Twoje filtry i wybrany okres zostaną zachowane."
            actions={<RetryButton onClick={() => (demo === 'error' ? onDemo('data') : fetchData(false))} />}
          />
        )}

        {load.status === 'ready' && sorted.length === 0 && (narrowed ? (
          <StateView
            kind="no-results"
            title="Nic nie znaleziono"
            text={`Żaden dokument w rejestrze ${registerLabel} za ${MONTHS[period.month].toLowerCase()} ${period.year} nie pasuje do wyszukiwania lub filtrów.`}
            actions={<button className="btn btn--outline" onClick={resetNarrowing}>Wyczyść wyszukiwanie i filtry</button>}
          />
        ) : (
          <StateView
            kind="empty"
            title={`Brak dokumentów w ${periodLabel}`}
            text={`W rejestrze ${registerLabel} nie ma jeszcze dokumentów za ten okres. Wybierz inny miesiąc, aby zobaczyć dane.`}
            actions={demo === 'data' && !(period.year === 2026 && period.month === 9) ? (
              <button className="btn btn--outline" onClick={() => setPeriod({ year: 2026, month: 9 })}>Przejdź do października 2026</button>
            ) : undefined}
          />
        ))}

        {load.status === 'ready' && sorted.length > 0 && (
          <>
            <DocumentList docs={pageDocs} columns={columns} sort={sort} onSort={onSort}
              expanded={expanded} onToggle={toggleRow} compact={compact} />
            <Pagination page={page} pageSize={pageSize} total={sorted.length} onPage={setPage} onPageSize={setPageSize} />
          </>
        )}
      </section>
    </main>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="chip chip--active">
      {label}
      <button onClick={onRemove} aria-label={`Usuń filtr ${label}`}>×</button>
    </span>
  )
}
