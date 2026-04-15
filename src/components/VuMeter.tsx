interface Props {
  level: number
  label?: string
}

const SEGMENTS = 24
const DB_LABELS = ['-20', '-10', '-5', '-2', '0', '3']
const DB_POSITIONS = [0, 0.33, 0.5, 0.67, 0.83, 1.0]

export function VuMeter({ level, label }: Props) {
  const litCount = Math.round(level * SEGMENTS)

  return (
    <div style={styles.container}>
      {label && <span style={styles.label}>{label}</span>}
      <div style={styles.meterWrap}>
        <div style={styles.barRow}>
          {Array.from({ length: SEGMENTS }, (_, i) => {
            const ratio = i / SEGMENTS
            const isLit = i < litCount
            let color: string
            if (ratio >= 0.85) color = '#ff3030'
            else if (ratio >= 0.7) color = '#d4a030'
            else color = '#40c040'

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 6,
                  background: isLit ? color : '#1a2a1a',
                  boxShadow: isLit ? `0 0 3px ${color}` : 'none',
                }}
              />
            )
          })}
        </div>
        <div style={styles.scaleRow}>
          {DB_LABELS.map((db, i) => (
            <span
              key={db}
              style={{
                ...styles.scaleLabel,
                left: `${DB_POSITIONS[i]! * 100}%`,
              }}
            >
              {db}
            </span>
          ))}
        </div>
      </div>
      <span style={styles.dbText}>dB</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 8px',
    background: '#1a1a10',
    borderTop: '2px solid #0a0a0a',
    borderLeft: '2px solid #0a0a0a',
    borderRight: '2px solid #dfdfdf',
    borderBottom: '2px solid #dfdfdf',
    minWidth: 180,
  },
  label: {
    fontSize: 9,
    color: '#40c040',
    fontFamily: 'var(--font-dot)',
    flexShrink: 0,
  },
  meterWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  barRow: {
    display: 'flex',
    gap: 1,
    height: 6,
  },
  scaleRow: {
    position: 'relative',
    height: 8,
  },
  scaleLabel: {
    position: 'absolute',
    fontSize: 7,
    color: '#40c040',
    fontFamily: 'var(--font-dot)',
    transform: 'translateX(-50%)',
    opacity: 0.7,
  },
  dbText: {
    fontSize: 8,
    color: '#40c040',
    fontFamily: 'var(--font-dot)',
    flexShrink: 0,
  },
}
