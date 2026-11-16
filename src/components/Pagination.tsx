import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  pageSize: number
  total: number
  onPage: (p: number) => void
  onPageSize: (n: number) => void
}

export function Pagination({ page, pageSize, total, onPage, onPageSize }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total ? (page - 1) * pageSize + 1 : 0
  const to = Math.min(total, page * pageSize)

  return (
    <div className="pager">
      <span className="muted tnum">{from}–{to} z {total}</span>
      <div className="pager__nav">
        <button className="icon-btn icon-btn--sm" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Poprzednia strona">
          <ChevronLeft size={16} />
        </button>
        <span className="tnum">{page} / {pages}</span>
        <button className="icon-btn icon-btn--sm" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Następna strona">
          <ChevronRight size={16} />
        </button>
      </div>
      <label className="pager__size">
        <span className="sr-only">Liczba wierszy na stronie</span>
        <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>
          {[10, 25, 50].map((n) => <option key={n} value={n}>{n} na stronie</option>)}
        </select>
      </label>
    </div>
  )
}
