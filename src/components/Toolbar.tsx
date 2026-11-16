import { useState } from 'react'
import {
  ArrowDown, ArrowUp, Columns3, Download, Eye, EyeOff, FilterX, MoreHorizontal, Printer, Search,
  SlidersHorizontal, Tag, X,
} from 'lucide-react'
import { Popover } from './Popover'
import { JPK_CODES, OPERATIONS, type Register } from '../data/demo'

export interface Filters {
  operation: string // 'all' | operation name
  jpk: string // 'all' | code
  series: string[] // empty = all
}
export const EMPTY_FILTERS: Filters = { operation: 'all', jpk: 'all', series: [] }

export const SERIES: Record<Register, string[]> = { sales: ['FV', 'KOR'], purchases: ['FZ'] }

export type ColumnKey = 'contractor' | 'date' | 'number' | 'ksef' | 'identifier' | 'gross'
export interface Column { key: ColumnKey; label: string; visible: boolean }

export const DEFAULT_COLUMNS: Column[] = [
  { key: 'contractor', label: 'Kontrahent', visible: true },
  { key: 'date', label: 'Data', visible: true },
  { key: 'number', label: 'Numer dokumentu', visible: true },
  { key: 'ksef', label: 'Numer KSeF', visible: true },
  { key: 'identifier', label: 'Identyfikator', visible: true },
  { key: 'gross', label: 'Brutto', visible: true },
]

export const activeFilterCount = (f: Filters) =>
  (f.operation !== 'all' ? 1 : 0) + (f.jpk !== 'all' ? 1 : 0) + (f.series.length ? 1 : 0)

interface Props {
  register: Register
  query: string
  onQuery: (q: string) => void
  filters: Filters
  onFilters: (f: Filters) => void
  columns: Column[]
  onColumns: (c: Column[]) => void
  resultCount: number
  disabled?: boolean
  onPrint: () => void
  onExport: () => void
  onTags: () => void
}

export function Toolbar(p: Props) {
  const [open, setOpen] = useState<null | 'filters' | 'more' | 'columns'>(null)
  const close = () => setOpen(null)
  const count = activeFilterCount(p.filters)
  const set = (patch: Partial<Filters>) => p.onFilters({ ...p.filters, ...patch })

  const toggleSeries = (s: string) =>
    set({ series: p.filters.series.includes(s) ? p.filters.series.filter((x) => x !== s) : [...p.filters.series, s] })

  const moveColumn = (i: number, d: -1 | 1) => {
    const next = [...p.columns]
    const j = i + d
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    p.onColumns(next)
  }
  const toggleColumn = (i: number) => {
    const visibleCount = p.columns.filter((c) => c.visible).length
    if (p.columns[i].visible && visibleCount === 1) return
    p.onColumns(p.columns.map((c, k) => (k === i ? { ...c, visible: !c.visible } : c)))
  }

  return (
    <div className="toolbar">
      <label className="search">
        <Search size={18} className="search__icon" />
        <input
          type="search"
          value={p.query}
          placeholder="Szukaj dokumentu…"
          title="Kontrahent, NIP, numer dokumentu, KSeF lub identyfikator"
          onChange={(e) => p.onQuery(e.target.value)}
          disabled={p.disabled}
          aria-label="Szukaj"
        />
        {p.query && (
          <button className="search__clear" onClick={() => p.onQuery('')} aria-label="Wyczyść wyszukiwanie">
            <X size={16} />
          </button>
        )}
      </label>

      <Popover
        open={open === 'filters'}
        onClose={close}
        align="end"
        sheet
        title="Filtry"
        width={320}
        trigger={
          <button
            className={`btn btn--outline${count ? ' btn--on' : ''}`}
            onClick={() => setOpen(open === 'filters' ? null : 'filters')}
            disabled={p.disabled}
            aria-expanded={open === 'filters'}
          >
            <SlidersHorizontal size={16} />
            <span className="hide-xs">Filtry</span>
            {count > 0 && <span className="count">{count}</span>}
          </button>
        }
      >
        <div className="filters">
          <label className="field">
            <span className="field__label">Rodzaj operacji</span>
            <select value={p.filters.operation} onChange={(e) => set({ operation: e.target.value })}>
              <option value="all">Wszystkie</option>
              {OPERATIONS[p.register].map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Kod JPK V7</span>
            <select value={p.filters.jpk} onChange={(e) => set({ jpk: e.target.value })}>
              <option value="all">Wszystkie</option>
              {JPK_CODES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <div className="field">
            <span className="field__label">Serie dokumentów</span>
            <div className="chips">
              {SERIES[p.register].map((s) => (
                <button
                  key={s}
                  className={`chip${p.filters.series.includes(s) ? ' is-active' : ''}`}
                  onClick={() => toggleSeries(s)}
                  aria-pressed={p.filters.series.includes(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <small className="muted">Brak zaznaczenia = wszystkie serie</small>
          </div>
          <div className="filters__foot">
            <button className="btn btn--ghost" onClick={() => p.onFilters(EMPTY_FILTERS)} disabled={!count}>
              <FilterX size={16} /> Wyczyść
            </button>
            <button className="btn btn--primary" onClick={close}>
              Pokaż {p.resultCount}
            </button>
          </div>
        </div>
      </Popover>

      <Popover
        open={open === 'more' || open === 'columns'}
        onClose={close}
        align="end"
        sheet
        title={open === 'columns' ? 'Kolumny tabeli' : 'Więcej akcji'}
        width={open === 'columns' ? 300 : 230}
        trigger={
          <button
            className="icon-btn"
            onClick={() => setOpen(open ? null : 'more')}
            aria-label="Więcej akcji"
            aria-expanded={open === 'more'}
            title="Więcej akcji"
          >
            <MoreHorizontal size={18} />
          </button>
        }
      >
        {open === 'more' ? (
          <div role="menu">
            <button role="menuitem" className="menu__item" onClick={() => { close(); p.onExport() }} disabled={p.disabled}>
              <Download size={16} /> Eksportuj CSV
            </button>
            <button role="menuitem" className="menu__item" onClick={() => { close(); p.onPrint() }} disabled={p.disabled}>
              <Printer size={16} /> Drukuj rejestr
            </button>
            <button role="menuitem" className="menu__item" onClick={() => { close(); p.onTags() }}>
              <Tag size={16} /> Etykiety
            </button>
            <div className="menu__sep" />
            <button role="menuitem" className="menu__item" onClick={() => setOpen('columns')}>
              <Columns3 size={16} /> Ustawienia kolumn
            </button>
          </div>
        ) : (
          <div className="columns-edit">
            {p.columns.map((c, i) => (
              <div key={c.key} className={`columns-edit__row${c.visible ? '' : ' is-off'}`}>
                <button className="icon-btn icon-btn--ghost icon-btn--sm" onClick={() => toggleColumn(i)}
                  aria-label={c.visible ? `Ukryj ${c.label}` : `Pokaż ${c.label}`}>
                  {c.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <span>{c.label}</span>
                <button className="icon-btn icon-btn--ghost icon-btn--sm" onClick={() => moveColumn(i, -1)} disabled={i === 0} aria-label="Przesuń wyżej">
                  <ArrowUp size={16} />
                </button>
                <button className="icon-btn icon-btn--ghost icon-btn--sm" onClick={() => moveColumn(i, 1)} disabled={i === p.columns.length - 1} aria-label="Przesuń niżej">
                  <ArrowDown size={16} />
                </button>
              </div>
            ))}
            <div className="filters__foot">
              <button className="btn btn--ghost" onClick={() => p.onColumns(DEFAULT_COLUMNS)}>Przywróć</button>
              <button className="btn btn--primary" onClick={close}>Gotowe</button>
            </div>
          </div>
        )}
      </Popover>
    </div>
  )
}
