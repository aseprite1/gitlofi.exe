import { type ReactNode } from 'react'
import { useClickSound } from '../hooks/useClickSound'

interface Props {
  title: string
  children: ReactNode
  icon?: string
  style?: React.CSSProperties
}

export function Win98Window({ title, children, icon, style }: Props) {
  const playClick = useClickSound()

  return (
    <div style={{ ...styles.window, ...style }}>
      <div style={styles.titleBar}>
        <div style={styles.titleLeft}>
          {icon && <span style={styles.icon}>{icon}</span>}
          <span style={styles.titleText}>{title}</span>
        </div>
        <div style={styles.titleButtons}>
          <button style={styles.titleBtn} onClick={playClick}>_</button>
          <button style={styles.titleBtn} onClick={playClick}>□</button>
          <button style={{ ...styles.titleBtn, ...styles.closeBtn }} onClick={playClick}>✕</button>
        </div>
      </div>
      <div style={styles.menuBar}>
        <span style={styles.menuItem}>File</span>
        <span style={styles.menuItem}>Edit</span>
        <span style={styles.menuItem}>View</span>
        <span style={styles.menuItem}>Help</span>
      </div>
      <div style={styles.content}>
        {children}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  window: {
    background: '#c0c0c0',
    borderTop: '2px solid #dfdfdf',
    borderLeft: '2px solid #dfdfdf',
    borderRight: '2px solid #0a0a0a',
    borderBottom: '2px solid #0a0a0a',
    boxShadow: 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080',
    display: 'flex',
    flexDirection: 'column',
  },
  titleBar: {
    background: 'linear-gradient(90deg, #000080, #1084d0)',
    padding: '3px 4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    userSelect: 'none',
  },
  titleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  icon: {
    fontSize: 14,
    lineHeight: 1,
  },
  titleText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  titleButtons: {
    display: 'flex',
    gap: 2,
    flexShrink: 0,
  },
  titleBtn: {
    width: 16,
    height: 14,
    fontSize: 9,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#c0c0c0',
    borderTop: '1px solid #dfdfdf',
    borderLeft: '1px solid #dfdfdf',
    borderRight: '1px solid #0a0a0a',
    borderBottom: '1px solid #0a0a0a',
    cursor: 'pointer',
    padding: 0,
    color: '#000000',
  },
  closeBtn: {
    marginLeft: 2,
  },
  menuBar: {
    display: 'flex',
    gap: 0,
    padding: '2px 4px',
    borderBottom: '1px solid #808080',
  },
  menuItem: {
    padding: '1px 6px',
    fontSize: 12,
    cursor: 'pointer',
    color: '#000000',
  },
  content: {
    padding: 8,
    flex: 1,
  },
}
