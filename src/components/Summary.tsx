import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { RATES, grossOf, vatOf, type VatDocument } from '../data/demo'
import { formatMoney } from '../lib/format'

export function Summary({ docs }: { docs: VatDocument[] }) {
  const [open, setOpen] = useState(false)
  const net = docs.reduce((s, d) => s + d.net, 0)
  const vat = docs.reduce((s, d) => s + vatOf(d), 0)
  const gross = docs.reduce((s, d) => s + grossOf(d), 0)

  const byRate = RATES.map((rate) => {
    const list = docs.filter((d) => d.rate === rate)
    return { rate, vat: list.reduce((s, d) => s + vatOf(d), 0), net: list.reduce((s, d) => s + d.net, 0), n: list.length }
  }).filter((r) => r.n > 0)
  const maxNet = Math.max(1, ...byRate.map((r) => Math.abs(r.net)))

  return (
    <section className="summary card" aria-label="Podsumowanie okresu">
      <div className="summary__kpis">
        <div className="kpi kpi--main">
          <span className="kpi__label">Brutto</span>
          <span className="kpi__value">{formatMoney(gross)}</span>
        </div>
        <div className="kpi">
          <span className="kpi__label">Netto</span>
          <span className="kpi__value">{formatMoney(net)}</span>
        </div>
        <div className="kpi">
          <span className="kpi__label">VAT</span>
          <span className="kpi__value">{formatMoney(vat)}</span>
        </div>
      </div>

      <button className="summary__toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        Kwoty według stawek VAT
        <ChevronDown size={16} className={open ? 'rot' : ''} />
      </button>

      {open && (
        <div className="rates">
          {byRate.length === 0 && <p className="muted">Brak kwot w wybranym okresie.</p>}
          {byRate.map((r) => (
            <div key={r.rate} className="rate">
              <span className="rate__name">{r.rate}</span>
              <span className="rate__bar"><span style={{ width: `${(Math.abs(r.net) / maxNet) * 100}%` }} /></span>
              <span className="rate__vals">
                <span className="muted">netto {formatMoney(r.net)}</span>
                <strong>VAT {formatMoney(r.vat)}</strong>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
