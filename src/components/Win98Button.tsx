import { useClickSound } from '../hooks/useClickSound'

interface Props {
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  style?: React.CSSProperties
}

export function Win98Button({ children, onClick, active, disabled, style }: Props) {
  const playClick = useClickSound()

  const handleClick = () => {
    if (disabled) return
    playClick()
    onClick?.()
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        ...styles.btn,
        ...(active ? styles.active : {}),
        ...(disabled ? styles.disabled : {}),
        ...style,
      }}
    >
      {children}
    </button>
  )
}

const styles: Record<string, React.CSSProperties> = {
  btn: {
    background: '#c0c0c0',
    borderTop: '2px solid #dfdfdf',
    borderLeft: '2px solid #dfdfdf',
    borderRight: '2px solid #0a0a0a',
    borderBottom: '2px solid #0a0a0a',
    boxShadow: 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080',
    padding: '4px 12px',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    color: '#000000',
    minWidth: 75,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  active: {
    borderTop: '2px solid #0a0a0a',
    borderLeft: '2px solid #0a0a0a',
    borderRight: '2px solid #dfdfdf',
    borderBottom: '2px solid #dfdfdf',
    boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #ffffff',
    background: '#b0b0b0',
  },
  disabled: {
    color: '#808080',
    cursor: 'default',
    textShadow: '1px 1px 0 #ffffff',
  },
}
