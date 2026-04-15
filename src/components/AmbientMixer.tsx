import { useState, useRef, useCallback, useEffect } from 'react'
import * as Tone from 'tone'
import { AMBIENT_LAYERS } from '../lib/sampleManifest'
import { useClickSound } from '../hooks/useClickSound'

interface Props {
  minimized: boolean
  onMinimize: () => void
  zIndex: number
  onFocus: () => void
  bpm: number
}

interface PlayerRef {
  player: Tone.Player
  gain: Tone.Gain
  originalBpm: number
}

export function AmbientMixer({ minimized, onMinimize, zIndex, onFocus, bpm }: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ rain: true, drips: true })
  const [volumes, setVolumes] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const l of AMBIENT_LAYERS) init[l.id] = 50
    return init
  })

  const playersRef = useRef<Record<string, PlayerRef>>({})
  const enabledRef = useRef(enabled)
  const volumesRef = useRef(volumes)
  enabledRef.current = enabled
  volumesRef.current = volumes

  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const playClick = useClickSound()

  useEffect(() => {
    return () => {
      for (const ref of Object.values(playersRef.current)) {
        ref.player.stop()
        ref.player.dispose()
        ref.gain.dispose()
      }
      playersRef.current = {}
    }
  }, [])

  useEffect(() => {
    for (const layer of AMBIENT_LAYERS) {
      const ref = playersRef.current[layer.id]
      if (ref?.player.loaded) {
        ref.player.playbackRate = bpm / ref.originalBpm
      }
    }
  }, [bpm])

  const toggle = useCallback(async (id: string) => {
    playClick()
    const isOn = enabledRef.current[id]

    if (isOn) {
      const ref = playersRef.current[id]
      if (ref) {
        ref.gain.gain.value = 0
        ref.player.stop()
      }
      setEnabled(prev => ({ ...prev, [id]: false }))
      return
    }

    setEnabled(prev => ({ ...prev, [id]: true }))

    const ref = playersRef.current[id]
    const vol = (volumesRef.current[id] ?? 50) / 100 * 3

    if (ref) {
      ref.gain.gain.value = vol
      ref.player.start()
      return
    }

    const layer = AMBIENT_LAYERS.find(l => l.id === id)!
    await Tone.start()
    const gain = new Tone.Gain(vol).toDestination()
    const player = new Tone.Player({ url: layer.path, loop: true }).connect(gain)
    await Tone.loaded()
    player.playbackRate = bpm / layer.bpm
    player.start()
    playersRef.current[id] = { player, gain, originalBpm: layer.bpm }
  }, [bpm, playClick])

  const changeVolume = useCallback((id: string, val: number) => {
    setVolumes(prev => ({ ...prev, [id]: val }))
    const ref = playersRef.current[id]
    if (ref) {
      ref.gain.gain.value = val / 100 * 3
    }
  }, [])

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

  if (minimized) return null

  return (
    <div className="window" onPointerDown={onFocus} style={{
      position: 'fixed',
      top: 250,
      left: 12,
      transform: `translate(${pos.x}px, ${pos.y}px)`,
      zIndex,
      width: 200,
    }}>
      <div
        className="title-bar"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        style={{ cursor: 'grab', touchAction: 'none' }}
      >
        <div className="title-bar-text">Ambient Mixer</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize} />
          <button aria-label="Close" onClick={onMinimize} />
        </div>
      </div>
      <div style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {AMBIENT_LAYERS.map(layer => (
          <div key={layer.id} style={styles.row}>
            <input
              type="checkbox"
              checked={!!enabled[layer.id]}
              onChange={() => toggle(layer.id)}
              id={`amb-${layer.id}`}
            />
            <label htmlFor={`amb-${layer.id}`} style={styles.label}>{layer.name}</label>
            <input
              type="range"
              min={0}
              max={100}
              value={volumes[layer.id] ?? 50}
              onChange={e => changeVolume(layer.id, Number(e.target.value))}
              style={{ flex: 1, minWidth: 50 }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    minWidth: 55,
  },
}
