import { useState } from 'react'
import { useClickSound } from '../hooks/useClickSound'

interface Props {
  onSubmit: (username: string) => void
  loading: boolean
}

export function UsernameInput({ onSubmit, loading }: Props) {
  const [value, setValue] = useState('')
  const playClick = useClickSound()

  const parseUsername = (input: string): string => {
    const trimmed = input.trim()
    try {
      const url = new URL(trimmed)
      if (url.hostname === 'github.com' || url.hostname === 'www.github.com') {
        const segments = url.pathname.split('/').filter(Boolean)
        return segments[0] ?? trimmed
      }
    } catch { /* not a URL */ }
    return trimmed
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const username = parseUsername(value)
    if (username && !loading) {
      playClick()
      onSubmit(username)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="field-row" style={{ gap: 4, alignItems: 'center' }}>
        <label htmlFor="username" style={{ whiteSpace: 'nowrap' }}>GitHub User:</label>
        <input
          id="username"
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="username or profile URL"
          disabled={loading}
          style={{ width: 260 }}
        />
        <button type="submit" disabled={loading || !value.trim()}>
          {loading ? 'Loading...' : 'Generate ▶'}
        </button>
      </div>
    </form>
  )
}
