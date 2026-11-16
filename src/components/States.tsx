import type { ReactNode } from 'react'
import { FileSearch, FolderOpen, RefreshCw, TriangleAlert } from 'lucide-react'

interface StateProps {
  kind: 'empty' | 'no-results' | 'error'
  title: string
  text: string
  actions?: ReactNode
}

const ICONS = { empty: FolderOpen, 'no-results': FileSearch, error: TriangleAlert }

export function StateView({ kind, title, text, actions }: StateProps) {
  const Icon = ICONS[kind]
  return (
    <div className={`state state--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <span className="state__icon"><Icon size={26} /></span>
      <h3>{title}</h3>
      <p>{text}</p>
      {actions && <div className="state__actions">{actions}</div>}
    </div>
  )
}

export function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="btn btn--primary" onClick={onClick}>
      <RefreshCw size={16} /> Spróbuj ponownie
    </button>
  )
}

export function Skeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Wczytywanie">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton__row">
          <span style={{ width: '22%' }} /><span style={{ width: '14%' }} /><span style={{ width: '26%' }} />
          <span style={{ width: '18%' }} /><span style={{ width: '12%' }} />
        </div>
      ))}
    </div>
  )
}
