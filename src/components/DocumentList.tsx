import { Fragment, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, CircleCheck, Clock3 } from 'lucide-react'
import { grossOf, vatOf, type VatDocument } from '../data/demo'
import { formatDate, formatMoney } from '../lib/format'
import type { Column, ColumnKey } from './Toolbar'

export type SortKey = Exclude<ColumnKey, 'ksef'>
export interface Sort { key: SortKey; dir: 'asc' | 'desc' }

interface Props {
  docs: VatDocument[]
  columns: Column[]
  sort: Sort
  onSort: (key: SortKey) => void
  expanded: Set<string>
  onToggle: (id: string) => void
  compact: boolean
}

function KsefBadge({ doc }: { doc: VatDocument }) {
  if (doc.ksef.status === 'confirmed')
    return (
      <span className="badge badge--ok" title={doc.ksef.number}>
        <CircleCheck size={14} /> <span className="mono ellipsis">{doc.ksef.number}</span>
      </span>
    )
  return <span className="badge badge--warn"><Clock3 size={14} /> Brak potwierdzenia</span>
}

function cell(doc: VatDocument, key: ColumnKey): ReactNode {
  switch (key) {
    case 'contractor': return <strong>{doc.contractor}</strong>
    case 'date': return <span className="tnum">{formatDate(doc.issueDate)}</span>
    case 'number': return <span className="mono">{doc.number}</span>
    case 'ksef': return <KsefBadge doc={doc} />
    case 'identifier': return <span className="mono muted">{doc.identifier}</span>
    case 'gross': return <span className="tnum">{formatMoney(grossOf(doc))}</span>
  }
}

function Details({ doc }: { doc: VatDocument }) {
  const rows: [string, ReactNode][] = [
    ['NIP kontrahenta', <span className="mono">{doc.nip}</span>],
    ['Data wystawienia', formatDate(doc.issueDate)],
    ['Data sprzedaży', formatDate(doc.saleDate)],
    ['Seria', doc.series],
    ['Rodzaj operacji', doc.operation],
    ['Kod JPK V7', doc.jpkCode],
    ['Stawka VAT', doc.rate],
    ['Netto', formatMoney(doc.net)],
    ['VAT', formatMoney(vatOf(doc))],
    ['Brutto', <strong>{formatMoney(grossOf(doc))}</strong>],
    ['Numer KSeF', doc.ksef.number ?? 'Brak potwierdzenia'],
    ['Identyfikator', <span className="mono">{doc.identifier}</span>],
  ]
  return (
    <dl className="details">
      {rows.map(([k, v]) => (
        <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
      ))}
    </dl>
  )
}

export function DocumentList({ docs, columns, sort, onSort, expanded, onToggle, compact }: Props) {
  const visible = columns.filter((c) => c.visible)

  if (compact) {
    return (
      <ul className="cards">
        {docs.map((d) => {
          const isOpen = expanded.has(d.id)
          return (
            <li key={d.id} className={`doc-card${isOpen ? ' is-open' : ''}`}>
              <button className="doc-card__main" onClick={() => onToggle(d.id)} aria-expanded={isOpen}>
                <span className="doc-card__row">
                  <strong>{d.contractor}</strong>
                  <strong className="tnum">{formatMoney(grossOf(d))}</strong>
                </span>
                <span className="doc-card__row muted">
                  <span className="mono ellipsis">{d.number}</span>
                  <span className="tnum">{formatDate(d.issueDate)}</span>
                </span>
                <span className="doc-card__row">
                  <KsefBadge doc={d} />
                  <ChevronDown size={18} className={`muted${isOpen ? ' rot' : ''}`} />
                </span>
              </button>
              {isOpen && <Details doc={d} />}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {visible.map((c) => {
              const sortable = c.key !== 'ksef'
              const active = sortable && sort.key === c.key
              return (
                <th key={c.key} className={`col-${c.key}${c.key === 'gross' ? ' num' : ''}`}
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                  {sortable ? (
                    <button className={`th-btn${active ? ' is-active' : ''}`} onClick={() => onSort(c.key as SortKey)}>
                      {c.label}
                      {active ? (sort.dir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="th-btn__idle" />}
                    </button>
                  ) : c.label}
                </th>
              )
            })}
            <th className="col-x"><span className="sr-only">Szczegóły</span></th>
          </tr>
        </thead>
        <tbody>
          {docs.map((d) => {
            const isOpen = expanded.has(d.id)
            return (
              <Fragment key={d.id}>
                <tr className={`row${isOpen ? ' is-open' : ''}`} onClick={() => onToggle(d.id)}>
                  {visible.map((c) => (
                    <td key={c.key} className={`col-${c.key}${c.key === 'gross' ? ' num' : ''}`}>{cell(d, c.key)}</td>
                  ))}
                  <td className="col-x">
                    <button className="icon-btn icon-btn--ghost icon-btn--sm" aria-expanded={isOpen}
                      aria-label={`Szczegóły ${d.number}`} onClick={(e) => { e.stopPropagation(); onToggle(d.id) }}>
                      <ChevronDown size={18} className={isOpen ? 'rot' : ''} />
                    </button>
                  </td>
                </tr>
                {isOpen && (
                  <tr className="row-details">
                    <td colSpan={visible.length + 1}><Details doc={d} /></td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
