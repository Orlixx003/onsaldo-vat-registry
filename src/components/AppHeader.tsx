import { useState } from 'react'
import { Bell, ChevronDown, Landmark, Archive, ListChecks, Moon, ReceiptText, Sun, UserRound, LogOut, Settings } from 'lucide-react'
import { Popover } from './Popover'

const AREAS = [
  { key: 'vat', label: 'Rejestry i VAT', icon: ReceiptText },
  { key: 'posting', label: 'Księgowania', icon: Landmark },
  { key: 'assets', label: 'Majątek', icon: Archive },
  { key: 'controls', label: 'Kontrole', icon: ListChecks },
]

const NOTIFICATIONS = [
  { title: 'Kontekst VAT wymaga potwierdzenia', time: '10 min temu' },
  { title: '14 dokumentów sprzedaży czeka na KSeF', time: '1 godz. temu' },
  { title: 'Okres 2026 wymaga konfiguracji', time: 'wczoraj' },
  { title: 'Nowe dane demonstracyjne', time: '2 dni temu' },
]

interface Props {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onNotify: (msg: string) => void
}

export function AppHeader({ theme, onToggleTheme, onNotify }: Props) {
  const [menu, setMenu] = useState<null | 'bell' | 'user'>(null)
  const close = () => setMenu(null)

  return (
    <header className="appbar">
      <div className="appbar__top">
        <div className="brand">
          <span className="brand__mark">O</span>
          <span className="brand__org">
            <small>Organizacja</small>
            Onsaldo Preview Sp. z o.o.
          </span>
        </div>

        <div className="appbar__actions">
          <button
            className="icon-btn icon-btn--ghost"
            onClick={onToggleTheme}
            aria-label={theme === 'light' ? 'Włącz tryb ciemny' : 'Włącz tryb jasny'}
            title={theme === 'light' ? 'Tryb ciemny' : 'Tryb jasny'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <Popover
            open={menu === 'bell'}
            onClose={close}
            align="end"
            width={300}
            trigger={
              <button
                className="icon-btn icon-btn--ghost"
                aria-label="Powiadomienia (4)"
                onClick={() => setMenu(menu === 'bell' ? null : 'bell')}
              >
                <Bell size={18} />
                <span className="dot-badge">4</span>
              </button>
            }
          >
            <div className="menu__label">Powiadomienia</div>
            {NOTIFICATIONS.map((n) => (
              <button key={n.title} className="menu__item menu__item--stack" onClick={close}>
                <span>{n.title}</span>
                <small>{n.time}</small>
              </button>
            ))}
          </Popover>

          <span className="appbar__divider" />

          <Popover
            open={menu === 'user'}
            onClose={close}
            align="end"
            width={220}
            trigger={
              <button className="user-btn" onClick={() => setMenu(menu === 'user' ? null : 'user')}>
                <span className="user-btn__text">
                  <strong>Preview Reviewer</strong>
                  <small>Konto użytkownika</small>
                </span>
                <span className="avatar"><UserRound size={18} /></span>
                <ChevronDown size={16} className="muted" />
              </button>
            }
          >
            <button className="menu__item" onClick={() => { close(); onNotify('Ustawienia konta — demo') }}>
              <Settings size={16} /> Ustawienia konta
            </button>
            <button className="menu__item" onClick={() => { close(); onNotify('Wylogowano (demo)') }}>
              <LogOut size={16} /> Wyloguj
            </button>
          </Popover>
        </div>
      </div>

      <nav className="areas" aria-label="Obszary księgowe">
        <span className="areas__crumb">Ewidencje</span>
        {AREAS.map(({ key, label, icon: Icon }) => (
          <a
            key={key}
            href="#"
            className={`areas__link${key === 'vat' ? ' is-active' : ''}`}
            aria-current={key === 'vat' ? 'page' : undefined}
            onClick={(e) => { e.preventDefault(); if (key !== 'vat') onNotify(`${label} — poza zakresem tego demo`) }}
          >
            <Icon size={16} /> {label}
          </a>
        ))}
      </nav>
    </header>
  )
}
