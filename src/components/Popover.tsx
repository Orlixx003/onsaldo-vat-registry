import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useDismiss } from '../lib/hooks'

interface Props {
  open: boolean
  onClose: () => void
  trigger: ReactNode
  children: ReactNode
  align?: 'start' | 'end'
  /** On narrow screens render as a bottom sheet with a title bar. */
  sheet?: boolean
  title?: string
  width?: number
}

export function Popover({ open, onClose, trigger, children, align = 'start', sheet, title, width }: Props) {
  const ref = useDismiss<HTMLDivElement>(open, onClose)
  return (
    <div className="pop" ref={ref}>
      {trigger}
      {open && (
        <>
          {sheet && <div className="pop__scrim" onClick={onClose} />}
          <div
            className={`pop__panel pop__panel--${align}${sheet ? ' pop__panel--sheet' : ''}`}
            style={width ? { width } : undefined}
            role="dialog"
            aria-label={title}
          >
            {sheet && title && (
              <div className="pop__head">
                <strong>{title}</strong>
                <button className="icon-btn icon-btn--ghost" onClick={onClose} aria-label="Zamknij">
                  <X size={18} />
                </button>
              </div>
            )}
            {children}
          </div>
        </>
      )}
    </div>
  )
}
