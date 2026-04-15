import { memo, useCallback } from 'react'
import type { SequencerPattern, ContributionData } from '../types'

const DEFAULT_LABELS = [
  { name: 'Shaker', day: 'Sun' },
  { name: 'Hat-C', day: 'Mon' },
  { name: 'Kick', day: 'Tue' },
  { name: 'Snare', day: 'Wed' },
  { name: 'Hat-O', day: 'Thu' },
  { name: 'Clap', day: 'Fri' },
  { name: 'Rim', day: 'Sat' },
]

const LEVEL_COLORS = [
  '#d4c4a8',
  '#7b9971',
  '#5a8a4a',
  '#3a7a2a',
  '#2a6a1a',
]

const OVERRIDE_COLOR = '#5b7fbf'
const OVERRIDE_ACTIVE_COLOR = '#7b9fdf'

interface Props {
  pattern: SequencerPattern
  currentStep: number
  data: ContributionData
  overrides?: Record<string, boolean>
  onCellClick?: (row: number, col: number) => void
}

export function SequencerGrid({ pattern, currentStep, data, overrides, onCellClick }: Props) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.labels}>
        {DEFAULT_LABELS.map((label, i) => (
          <div key={i} style={styles.label}>
            <span style={styles.labelName}>{label.name}</span>
            <span style={styles.labelDay}>{label.day}</span>
          </div>
        ))}
      </div>
      <div style={styles.gridScroll} className="sunken-panel">
        <div
          style={{
            ...styles.grid,
            gridTemplateColumns: `repeat(${pattern.cols}, var(--cell-size))`,
          }}
        >
          {Array.from({ length: pattern.rows }, (_, row) =>
            Array.from({ length: pattern.cols }, (_, col) => {
              const vel = pattern.grid[row]?.[col] ?? 0
              const level = Math.round(vel * 4)
              const isActive = col === currentStep && vel > 0
              const isOverride = overrides?.[`${row}-${col}`] !== undefined

              const week = data.weeks[col]
              const day = week?.days.find(d => d.weekday === row)

              return (
                <Cell
                  key={`${row}-${col}`}
                  row={row}
                  col={col}
                  level={level}
                  isPlayhead={col === currentStep}
                  isActive={isActive}
                  isOverride={isOverride}
                  title={day ? `${day.date}: ${day.count} contributions` : 'Click to toggle'}
                  onClick={onCellClick}
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

const Cell = memo(function Cell({
  row,
  col,
  level,
  isPlayhead,
  isActive,
  isOverride,
  title,
  onClick,
}: {
  row: number
  col: number
  level: number
  isPlayhead: boolean
  isActive: boolean
  isOverride: boolean
  title: string
  onClick?: (row: number, col: number) => void
}) {
  const handleClick = useCallback(() => {
    onClick?.(row, col)
  }, [onClick, row, col])

  let bg: string
  if (isPlayhead) {
    bg = isActive
      ? isOverride ? OVERRIDE_ACTIVE_COLOR : '#e08030'
      : 'rgba(224, 128, 48, 0.45)'
  } else if (isOverride && level > 0) {
    bg = OVERRIDE_COLOR
  } else {
    bg = LEVEL_COLORS[level] ?? LEVEL_COLORS[0]!
  }

  return (
    <div
      title={title}
      onClick={handleClick}
      style={{
        width: 'var(--cell-size)',
        height: 'var(--cell-size)',
        borderRadius: 1,
        background: bg,
        transition: 'background 0.06s',
        animation: isActive ? 'pulse 0.15s ease-out' : undefined,
        boxShadow: isActive
          ? `0 0 8px ${isOverride ? 'rgba(91, 127, 191, 0.8)' : 'rgba(224, 128, 48, 0.8)'}`
          : isPlayhead
            ? '0 0 3px rgba(224, 128, 48, 0.3)'
            : undefined,
        border: isOverride && level > 0
          ? '1px solid rgba(91, 127, 191, 0.6)'
          : isPlayhead
            ? '1px solid rgba(224, 128, 48, 0.5)'
            : '1px solid rgba(0,0,0,0.08)',
        cursor: 'pointer',
      }}
    />
  )
})

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    gap: 6,
  },
  labels: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--cell-gap)',
    flexShrink: 0,
  },
  label: {
    height: 'var(--cell-size)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'flex-end',
  },
  labelName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#5c4a32',
    whiteSpace: 'nowrap',
  },
  labelDay: {
    fontSize: 10,
    color: '#8b7355',
    width: 22,
    textAlign: 'right',
  },
  gridScroll: {
    overflowX: 'auto',
    flex: 1,
    padding: 4,
  },
  grid: {
    display: 'grid',
    gridTemplateRows: 'repeat(7, var(--cell-size))',
    gap: 'var(--cell-gap)',
    width: 'fit-content',
  },
}
