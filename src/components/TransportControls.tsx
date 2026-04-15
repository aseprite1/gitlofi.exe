import { useRef, useCallback } from 'react'
import { useClickSound } from '../hooks/useClickSound'

interface Props {
  isPlaying: boolean
  bpm: number
  volume: number
  onPlay: () => void
  onStop: () => void
  onBpmChange: (bpm: number) => void
  onVolumeChange: (volume: number) => void
  loading?: boolean
}

function DraggableLed({ value, min, max, onChange }: {
  value: number; min: number; max: number; onChange: (v: number) => void
}) {
  const dragRef = useRef<{ startY: number; startVal: number } | null>(null)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { startY: e.clientY, startVal: value }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [value])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const dy = dragRef.current.startY - e.clientY
    const range = max - min
    const newVal = Math.round(Math.max(min, Math.min(max, dragRef.current.startVal + dy * (range / 150))))
    onChange(newVal)
  }, [min, max, onChange])

  const onPointerUp = useCallback(() => { dragRef.current = null }, [])

  return (
    <div
      style={styles.led}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {value}
    </div>
  )
}

export function TransportControls({
  isPlaying,
  bpm,
  volume,
  onPlay,
  onStop,
  onBpmChange,
  onVolumeChange,
  loading = false,
}: Props) {
  const playClick = useClickSound()

  const handlePlay = () => { playClick(); onPlay() }
  const handleStop = () => { playClick(); onStop() }

  return (
    <div style={styles.row}>
      <button
        onClick={isPlaying ? handleStop : handlePlay}
        disabled={loading}
        style={{ minWidth: 75, fontWeight: 'bold' }}
      >
        {loading ? '⏳' : isPlaying ? '⏹ Stop' : '▶ Play'}
      </button>

      <div style={styles.sep} />

      <span style={styles.label}>BPM</span>
      <DraggableLed value={bpm} min={60} max={120} onChange={onBpmChange} />
      <input
        type="range"
        min={60}
        max={120}
        value={bpm}
        onChange={e => onBpmChange(Number(e.target.value))}
        style={{ width: 90 }}
      />

      <div style={styles.sep} />

      <span style={styles.label}>VOL</span>
      <DraggableLed
        value={Math.round(volume * 100)}
        min={0}
        max={100}
        onChange={v => onVolumeChange(v / 100)}
      />
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(volume * 100)}
        onChange={e => onVolumeChange(Number(e.target.value) / 100)}
        style={{ width: 70 }}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 6px',
    flexWrap: 'wrap',
  },
  sep: {
    width: 1,
    height: 18,
    borderLeft: '1px solid #808080',
    borderRight: '1px solid #fff',
  },
  label: {
    fontSize: 10,
    color: '#5c4a32',
    fontFamily: 'var(--font-dot)',
  },
  led: {
    background: '#2a2a1a',
    color: '#7ec850',
    fontFamily: 'var(--font-dot)',
    fontSize: 11,
    padding: '2px 6px',
    minWidth: 32,
    textAlign: 'center',
    borderTop: '1px solid #0a0a0a',
    borderLeft: '1px solid #0a0a0a',
    borderRight: '1px solid #808080',
    borderBottom: '1px solid #808080',
    cursor: 'ns-resize',
    userSelect: 'none',
    touchAction: 'none',
  },
}
