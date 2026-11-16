import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { Popover } from './Popover'
import { MONTHS, MONTHS_SHORT } from '../lib/format'

const YEARS = [2024, 2025, 2026]

interface Props {
  year: number
  month: number // 0-11
  onChange: (year: number, month: number) => void
}

export function PeriodPicker({ year, month, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [draftYear, setDraftYear] = useState(year)

  const shift = (delta: number) => {
    const idx = year * 12 + month + delta
    const y = Math.floor(idx / 12)
    if (y < YEARS[0] || y > YEARS[YEARS.length - 1]) return
    onChange(y, idx % 12)
  }
  const atStart = year === YEARS[0] && month === 0
  const atEnd = year === YEARS[YEARS.length - 1] && month === 11

  return (
    <div className="period">
      <button className="icon-btn" onClick={() => shift(-1)} disabled={atStart} aria-label="Poprzedni miesiąc">
        <ChevronLeft size={18} />
      </button>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        align="end"
        width={280}
        trigger={
          <button
            className="period__btn"
            onClick={() => { setDraftYear(year); setOpen(!open) }}
            aria-label={`Okres: ${MONTHS[month]} ${year}. Zmień rok i miesiąc`}
          >
            <CalendarDays size={16} />
            <span>{MONTHS[month]} {year}</span>
          </button>
        }
      >
        <div className="period__panel">
          <div className="field">
            <span className="field__label">Rok</span>
            <div className="seg seg--sm">
              {YEARS.map((y) => (
                <button key={y} className={y === draftYear ? 'is-active' : ''} onClick={() => setDraftYear(y)}>
                  {y}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="field__label">Miesiąc</span>
            <div className="month-grid">
              {MONTHS_SHORT.map((m, i) => (
                <button
                  key={m}
                  className={draftYear === year && i === month ? 'is-active' : ''}
                  onClick={() => { onChange(draftYear, i); setOpen(false) }}
                  title={MONTHS[i]}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Popover>
      <button className="icon-btn" onClick={() => shift(1)} disabled={atEnd} aria-label="Następny miesiąc">
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
