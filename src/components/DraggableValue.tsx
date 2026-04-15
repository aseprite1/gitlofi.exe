import { useRef, useCallback, useState, useEffect } from 'react'

interface Props {
  value: number
  min: number
  max: number
  step?: number
  sensitivity?: number
  onChange: (value: number) => void
  format?: (value: number) => string
  style?: React.CSSProperties
}

export function DraggableValue({
  value,
  min,
  max,
  step = 1,
  sensitivity = 0.5,
  onChange,
  format,
  style,
}: Props) {
  const dragState = useRef<{ startY: number; startValue: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const clamp = useCallback(
    (v: number) => {
      const stepped = Math.round(v / step) * step
      return Math.max(min, Math.min(max, stepped))
    },
    [min, max, step]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isEditing) return
      e.preventDefault()
      dragState.current = { startY: e.clientY, startValue: value }
      setIsDragging(true)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [value, isEditing]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.current) return
      const dy = dragState.current.startY - e.clientY
      const newValue = clamp(dragState.current.startValue + dy * sensitivity)
      onChange(newValue)
    },
    [clamp, onChange, sensitivity]
  )

  const handlePointerUp = useCallback(() => {
    dragState.current = null
    setIsDragging(false)
  }, [])

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
    setEditText(String(Math.round(value)))
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const commitEdit = useCallback(() => {
    const parsed = parseFloat(editText)
    if (!isNaN(parsed)) {
      onChange(clamp(parsed))
    }
    setIsEditing(false)
  }, [editText, clamp, onChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') commitEdit()
      if (e.key === 'Escape') setIsEditing(false)
    },
    [commitEdit]
  )

  const displayValue = format ? format(value) : String(Math.round(value))

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editText}
        onChange={e => setEditText(e.target.value)}
        onBlur={commitEdit}
        onKeyDown={handleKeyDown}
        style={{
          ...styles.base,
          ...style,
          ...styles.input,
          width: `${Math.max(displayValue.length, 3) + 1}ch`,
        }}
      />
    )
  }

  return (
    <span
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      style={{
        ...styles.base,
        ...style,
        cursor: isDragging ? 'ns-resize' : 'ns-resize',
        opacity: isDragging ? 1 : undefined,
        textShadow: isDragging
          ? '0 0 12px rgba(88, 166, 255, 0.6)'
          : style?.textShadow,
        color: isDragging ? '#58a6ff' : style?.color,
      }}
    >
      {displayValue}
    </span>
  )
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    userSelect: 'none',
    touchAction: 'none',
  },
  input: {
    background: 'rgba(88, 166, 255, 0.1)',
    border: '1px solid #58a6ff',
    borderRadius: 3,
    outline: 'none',
    textAlign: 'center',
    padding: '0 4px',
    margin: 0,
  },
}
