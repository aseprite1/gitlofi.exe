import type { LanguageProfile } from '../lib/languages'

interface Props {
  profile: LanguageProfile
}

const FAMILY_LABELS: Record<string, string> = {
  systems: 'Cold & Crisp',
  web: 'Bright & Snappy',
  scripting: 'Deep & Warm',
  data: 'Soft & Dreamy',
  mobile: 'Tight & Minimal',
  mixed: 'Balanced',
}

export function LanguageBar({ profile }: Props) {
  if (profile.entries.length === 0) return null

  const topEntries = profile.entries.slice(0, 6)
  const rest = profile.entries.slice(6)
  const restPercent = rest.reduce((sum, e) => sum + e.percent, 0)

  return (
    <div style={{ padding: 4 }}>
      <div style={styles.header}>
        <b>Languages</b>
        <span style={{ color: '#808080' }}>{profile.totalRepos} repos</span>
      </div>

      <div className="sunken-panel" style={styles.barWrap}>
        <div style={styles.bar}>
          {topEntries.map(entry => (
            <div
              key={entry.name}
              title={`${entry.name} ${entry.percent.toFixed(1)}%`}
              style={{ width: `${Math.max(entry.percent, 2)}%`, height: '100%', background: entry.color }}
            />
          ))}
          {restPercent > 0 && (
            <div style={{ width: `${restPercent}%`, height: '100%', background: '#808080' }} />
          )}
        </div>
      </div>

      <div style={styles.labels}>
        {topEntries.map(entry => (
          <span key={entry.name} style={styles.labelItem}>
            <span style={{ ...styles.dot, background: entry.color }} />
            {entry.name} {entry.percent.toFixed(1)}%
          </span>
        ))}
      </div>

      <div style={styles.soundRow}>
        Sound profile: <b>{FAMILY_LABELS[profile.dominantFamily]}</b>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    marginBottom: 4,
  },
  barWrap: {
    padding: 2,
    marginBottom: 6,
  },
  bar: {
    display: 'flex',
    height: 10,
    gap: 1,
  },
  labels: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2px 12px',
    fontSize: 11,
    marginBottom: 6,
  },
  labelItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
  },
  dot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    border: '1px solid rgba(0,0,0,0.2)',
  },
  soundRow: {
    fontSize: 11,
    color: '#5c4a32',
    borderTop: '1px solid #808080',
    paddingTop: 4,
  },
}
