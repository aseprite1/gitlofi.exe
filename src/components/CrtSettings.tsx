import { useState, useRef, useCallback } from 'react'
import { useClickSound } from '../hooks/useClickSound'

export interface CrtEffects {
  scanlines: boolean
  vignette: boolean
  flicker: boolean
  rgbShift: boolean
  noise: boolean
  dotMask: boolean
  glow: boolean
}

const DEFAULT_EFFECTS: CrtEffects = {
  scanlines: true,
  vignette: true,
  flicker: true,
  rgbShift: true,
  noise: true,
  dotMask: true,
  glow: true,
}

interface Props {
  effects: CrtEffects
  onChange: (effects: CrtEffects) => void
  minimized: boolean
  onMinimize: () => void
  zIndex: number
  onFocus: () => void
}

const LABELS: Record<keyof CrtEffects, string> = {
  scanlines: 'Scanlines',
  vignette: 'Vignette',
  flicker: 'Flicker',
  rgbShift: 'RGB Shift',
  noise: 'Static Noise',
  dotMask: 'Dot Mask',
  glow: 'Glow/Bloom',
}

export function CrtSettings({ effects, onChange, minimized, onMinimize, zIndex, onFocus }: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const playClick = useClickSound()

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [pos])

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    setPos({
      x: dragRef.current.origX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.origY + (e.clientY - dragRef.current.startY),
    })
  }, [])

  const handleDragEnd = useCallback(() => { dragRef.current = null }, [])

  const toggle = (key: keyof CrtEffects) => {
    playClick()
    onChange({ ...effects, [key]: !effects[key] })
  }

  const allOn = () => {
    playClick()
    const all: CrtEffects = { scanlines: true, vignette: true, flicker: true, rgbShift: true, noise: true, dotMask: true, glow: true }
    onChange(all)
  }

  const allOff = () => {
    playClick()
    const none: CrtEffects = { scanlines: false, vignette: false, flicker: false, rgbShift: false, noise: false, dotMask: false, glow: false }
    onChange(none)
  }

  if (minimized) return null

  return (
    <div className="window" onPointerDown={onFocus} style={{
      position: 'fixed',
      top: 12,
      left: 12,
      transform: `translate(${pos.x}px, ${pos.y}px)`,
      zIndex,
      width: 170,
    }}>
      <div
        className="title-bar"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        style={{ cursor: 'grab', touchAction: 'none' }}
      >
        <div className="title-bar-text">CRT Effects</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={() => onMinimize()} />
          <button aria-label="Close" onClick={() => onMinimize()} />
        </div>
      </div>
      <div style={{ padding: 8 }}>
          {(Object.keys(LABELS) as (keyof CrtEffects)[]).map(key => (
            <div className="field-row" key={key} style={{ marginBottom: 2 }}>
              <input
                type="checkbox"
                id={`crt-${key}`}
                checked={effects[key]}
                onChange={() => toggle(key)}
              />
              <label htmlFor={`crt-${key}`} style={{ fontSize: 11 }}>{LABELS[key]}</label>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            <button onClick={allOn} style={{ flex: 1, fontSize: 10 }}>All On</button>
            <button onClick={allOff} style={{ flex: 1, fontSize: 10 }}>All Off</button>
          </div>
        </div>
    </div>
  )
}

export { DEFAULT_EFFECTS }
