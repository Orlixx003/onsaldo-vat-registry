import { useEffect, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { AppHeader } from './components/AppHeader'
import { RegistryPage, type DemoState } from './components/RegistryPage'

const STATES: { key: DemoState; label: string }[] = [
  { key: 'data', label: 'Dane' },
  { key: 'empty', label: 'Pusty' },
  { key: 'error', label: 'Błąd' },
]

const initialDemo = (): DemoState => {
  const s = new URLSearchParams(location.search).get('state')
  return s === 'empty' || s === 'error' ? s : 'data'
}

const initialTheme = (): 'light' | 'dark' => {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* storage unavailable */ }
  return 'light'
}

export default function App() {
  const [theme, setTheme] = useState(initialTheme)
  const [demo, setDemo] = useState<DemoState>(initialDemo)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('theme', theme) } catch { /* ignore */ }
  }, [theme])

  useEffect(() => {
    try {
      const url = new URL(location.href)
      if (demo === 'data') url.searchParams.delete('state')
      else url.searchParams.set('state', demo)
      history.replaceState(null, '', url)
    } catch { /* sandboxed frames may forbid URL updates */ }
  }, [demo])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <>
      <AppHeader theme={theme} onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} onNotify={setToast} />
      <RegistryPage demo={demo} onDemo={setDemo} notify={setToast} />

      <div className="demo-switch" role="group" aria-label="Podgląd stanu ekranu (tylko demo)">
        <span className="demo-switch__label"><FlaskConical size={14} /> Stan</span>
        {STATES.map((s) => (
          <button key={s.key} className={demo === s.key ? 'is-active' : ''} onClick={() => setDemo(s.key)} aria-pressed={demo === s.key}>
            {s.label}
          </button>
        ))}
      </div>

      <div className={`toast${toast ? ' is-visible' : ''}`} role="status" aria-live="polite">{toast}</div>
    </>
  )
}
