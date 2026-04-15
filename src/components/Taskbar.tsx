import { useState, useEffect } from 'react'
import { useClickSound } from '../hooks/useClickSound'

interface Props {
  isPlaying: boolean
  windowState: 'normal' | 'minimized' | 'maximized'
  vuMinimized: boolean
  crtMinimized: boolean
  ambientMinimized: boolean
  onRestore: () => void
  onVuToggle: () => void
  onCrtToggle: () => void
  onAmbientToggle: () => void
}

export function Taskbar({
  isPlaying, windowState, vuMinimized, crtMinimized, ambientMinimized,
  onRestore, onVuToggle, onCrtToggle, onAmbientToggle,
}: Props) {
  const [time, setTime] = useState('')
  const playClick = useClickSound()

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={styles.taskbar}>
      <button style={styles.startBtn} onClick={playClick}>
        <span>🎵</span>
        <b>Start</b>
      </button>

      <div style={styles.sep} />

      <button
        style={{ ...styles.taskBtn, ...(windowState !== 'minimized' ? styles.taskBtnActive : {}) }}
        onClick={() => { playClick(); onRestore() }}
      >
        <img src="/favicon.svg" alt="" style={{ width: 14, height: 14 }} />
        <span>gitlofi.exe</span>
      </button>

      <button
        style={{ ...styles.taskBtn, ...(!vuMinimized ? styles.taskBtnActive : {}) }}
        onClick={() => { playClick(); onVuToggle() }}
      >
        <span>📊</span>
        <span>VU Meter</span>
      </button>

      <button
        style={{ ...styles.taskBtn, ...(!crtMinimized ? styles.taskBtnActive : {}) }}
        onClick={() => { playClick(); onCrtToggle() }}
      >
        <span>CRT</span>
      </button>

      <button
        style={{ ...styles.taskBtn, ...(!ambientMinimized ? styles.taskBtnActive : {}) }}
        onClick={() => { playClick(); onAmbientToggle() }}
      >
        <span>Ambient</span>
      </button>

      {isPlaying && (
        <div style={styles.playingIndicator}>
          <span style={{ animation: 'blink-led 1s infinite' }}>●</span>
          <span>Playing...</span>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div style={styles.tray}>
        <span>🔊</span>
        <span>{time}</span>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  taskbar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    background: '#c0c0c0',
    borderTop: '2px solid #fff',
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px',
    gap: 3,
    zIndex: 9999,
  },
  startBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 6px',
    height: 22,
    fontWeight: 'bold',
    fontSize: 12,
    cursor: 'pointer',
  },
  sep: {
    width: 2,
    height: 20,
    borderLeft: '1px solid #808080',
    borderRight: '1px solid #fff',
  },
  taskBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    height: 22,
    fontSize: 11,
    minWidth: 0,
    textAlign: 'left',
    cursor: 'pointer',
  },
  taskBtnActive: {
    borderTop: '2px solid #0a0a0a',
    borderLeft: '2px solid #0a0a0a',
    borderRight: '2px solid #dfdfdf',
    borderBottom: '2px solid #dfdfdf',
    background: '#b0b0b0',
  },
  playingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    color: '#c04040',
    padding: '0 6px',
  },
  tray: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 8px',
    height: 22,
    borderTop: '1px solid #808080',
    borderLeft: '1px solid #808080',
    borderRight: '1px solid #fff',
    borderBottom: '1px solid #fff',
    fontSize: 11,
    fontFamily: 'var(--font-dot)',
  },
}
