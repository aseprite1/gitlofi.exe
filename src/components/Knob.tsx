import { useRef, useCallback, useEffect, useState } from 'react'

interface Props {
  value: number
  min: number
  max: number
  step?: number
  label: string
  unit?: string
  size?: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
}

export function Knob({
  value,
  min,
  max,
  step = 1,
  label,
  unit = '',
  size = 56,
  onChange,
  formatValue,
}: Props) {
  const knobRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{ startY: number; startValue: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const range = max - min
  const normalized = (value - min) / range
  const startAngle = -135
  const endAngle = 135
  const angle = startAngle + normalized * (endAngle - startAngle)

  const clamp = useCallback(
    (v: number) => {
      const stepped = Math.round(v / step) * step
      return Math.max(min, Math.min(max, stepped))
    },
    [min, max, step]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      dragState.current = { startY: e.clientY, startValue: value }
      setIsDragging(true)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [value]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.current) return
      const dy = dragState.current.startY - e.clientY
      const sensitivity = range / 150
      const newValue = clamp(dragState.current.startValue + dy * sensitivity)
      onChange(newValue)
    },
    [range, clamp, onChange]
  )

  const handlePointerUp = useCallback(() => {
    dragState.current = null
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const direction = e.deltaY < 0 ? 1 : -1
      onChange(clamp(value + direction * step))
    },
    [value, step, clamp, onChange]
  )

  useEffect(() => {
    const el = knobRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const handleDoubleClick = useCallback(() => {
    const defaultVal = (min + max) / 2
    onChange(clamp(defaultVal))
  }, [min, max, clamp, onChange])

  const r = (size - 8) / 2
  const cx = size / 2
  const cy = size / 2
  const tickCount = 11
  const displayValue = formatValue ? formatValue(value) : `${Math.round(value)}${unit}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, userSelect: 'none' }}>
      <span style={styles.label}>{label}</span>
      <div
        ref={knobRef}
        style={{ width: size, height: size, position: 'relative', cursor: isDragging ? 'grabbing' : 'grab' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track ticks */}
          {Array.from({ length: tickCount }, (_, i) => {
            const tickAngle = startAngle + (i / (tickCount - 1)) * (endAngle - startAngle)
            const rad = (tickAngle - 90) * (Math.PI / 180)
            const outerR = r + 2
            const innerR = r - 2
            return (
              <line
                key={i}
                x1={cx + Math.cos(rad) * innerR}
                y1={cy + Math.sin(rad) * innerR}
                x2={cx + Math.cos(rad) * outerR}
                y2={cy + Math.sin(rad) * outerR}
                stroke={i / (tickCount - 1) <= normalized ? '#39d353' : '#30363d'}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            )
          })}

          {/* Arc track (background) */}
          <circle
            cx={cx}
            cy={cy}
            r={r - 6}
            fill="none"
            stroke="#21262d"
            strokeWidth={3}
            strokeDasharray={`${(270 / 360) * 2 * Math.PI * (r - 6)} ${2 * Math.PI * (r - 6)}`}
            strokeLinecap="round"
            transform={`rotate(135, ${cx}, ${cy})`}
          />

          {/* Arc track (filled) */}
          <circle
            cx={cx}
            cy={cy}
            r={r - 6}
            fill="none"
            stroke={isDragging ? '#58a6ff' : '#39d353'}
            strokeWidth={3}
            strokeDasharray={`${normalized * (270 / 360) * 2 * Math.PI * (r - 6)} ${2 * Math.PI * (r - 6)}`}
            strokeLinecap="round"
            transform={`rotate(135, ${cx}, ${cy})`}
            style={{ transition: isDragging ? 'none' : 'stroke-dasharray 0.1s' }}
          />

          {/* Knob body */}
          <circle cx={cx} cy={cy} r={r - 12} fill="#1c2128" stroke="#30363d" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={r - 14} fill="url(#knobGrad)" />

          {/* Pointer line */}
          {(() => {
            const rad = (angle - 90) * (Math.PI / 180)
            const innerR2 = 4
            const outerR2 = r - 14
            return (
              <line
                x1={cx + Math.cos(rad) * innerR2}
                y1={cy + Math.sin(rad) * innerR2}
                x2={cx + Math.cos(rad) * outerR2}
                y2={cy + Math.sin(rad) * outerR2}
                stroke={isDragging ? '#58a6ff' : '#e6edf3'}
                strokeWidth={2}
                strokeLinecap="round"
              />
            )
          })()}

          <defs>
            <radialGradient id="knobGrad" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#2d333b" />
              <stop offset="100%" stopColor="#161b22" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <span style={styles.value}>{displayValue}</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    fontSize: 10,
    fontWeight: 700,
    color: '#7d8590',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e6edf3',
    fontFamily: 'var(--font-mono)',
    fontVariantNumeric: 'tabular-nums',
  },
}
