import { useState, useEffect, useCallback } from 'react'
import { useClickSound } from '../hooks/useClickSound'

const TIPS = [
  "It looks like you're making a lo-fi beat! Need help?",
  "Try changing the BPM for a different vibe!",
  "Nice groove! Your commits sound great.",
  "Tip: Weekend commits make rare accents!",
  "Did you know? Each day maps to a different drum.",
  "Share your beat with friends!",
  "Try different years for different patterns.",
  "The more you commit, the busier the beat!",
  "Lo-fi hip hop beats to code/relax to~",
  "Your GitHub contributions never sounded this good.",
]

export function Clippy() {
  const [message, setMessage] = useState(TIPS[0]!)
  const [visible, setVisible] = useState(true)
  const [bubbleVisible, setBubbleVisible] = useState(true)
  const playClick = useClickSound()

  const nextTip = useCallback(() => {
    playClick()
    const next = TIPS[Math.floor(Math.random() * TIPS.length)]!
    setMessage(next)
    setBubbleVisible(true)
  }, [playClick])

  useEffect(() => {
    const id = setInterval(() => {
      const next = TIPS[Math.floor(Math.random() * TIPS.length)]!
      setMessage(next)
      setBubbleVisible(true)
    }, 20000)
    return () => clearInterval(id)
  }, [])

  if (!visible) return null

  return (
    <div style={styles.container}>
      {bubbleVisible && (
        <div className="window" style={styles.bubble}>
          <div style={styles.bubbleContent}>
            <p style={styles.message}>{message}</p>
            <div style={styles.bubbleActions}>
              <button onClick={nextTip} style={{ fontSize: 11 }}>Next Tip</button>
              <button onClick={() => setBubbleVisible(false)} style={{ fontSize: 11 }}>OK</button>
              <button onClick={() => setVisible(false)} style={{ fontSize: 11 }}>Dismiss</button>
            </div>
          </div>
          <div style={styles.bubbleTail} />
        </div>
      )}
      <img
        src="/clippy-head-scratch.gif"
        alt="Clippy"
        style={styles.clippy}
        onClick={nextTip}
        title="Click for a tip!"
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: 36,
    right: 16,
    zIndex: 9998,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  bubble: {
    padding: 0,
    width: 230,
    position: 'relative',
    marginBottom: 4,
  },
  bubbleContent: {
    padding: '10px 12px',
    fontSize: 11,
    lineHeight: 1.5,
  },
  message: {
    marginBottom: 8,
    wordBreak: 'break-word',
  },
  bubbleActions: {
    display: 'flex',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -6,
    right: 50,
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid #c0c0c0',
  },
  clippy: {
    width: 120,
    height: 'auto',
    cursor: 'pointer',
    imageRendering: 'auto',
    transition: 'transform 0.2s',
  },
}
