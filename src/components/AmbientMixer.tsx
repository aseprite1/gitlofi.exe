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

interface LayerState {
  enabled: boolean
  volume: number
}

interface PlayerRef {
  player: Tone.Player
  gain: Tone.Gain
  originalBpm: number
  loaded: boolean
}

export function AmbientMixer({ minimized, onMinimize, zIndex, onFocus, bpm }: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [layers, setLayers] = useState<Record<string, LayerState>>(() => {
    const init: Record<string, LayerState> = {}
    for (const l of AMBIENT_LAYERS) {
      init[l.id] = { enabled: false, volume: 0.5 }
    }
    return init
  })
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const playersRef = useRef<Record<string, PlayerRef>>({})
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
      if (ref?.loaded) {
        ref.player.playbackRate = bpm / ref.originalBpm
      }
    }
  }, [bpm])

  const ensurePlayer = useCallback(async (id: string): Promise<PlayerRef> => {
    const existing = playersRef.current[id]
    if (existing?.loaded) return existing

    const layer = AMBIENT_LAYERS.find(l => l.id === id)!
    await Tone.start()

    const gain = new Tone.Gain(0).toDestination()
    const player = new Tone.Player({
      url: layer.path,
      loop: true,
    }).connect(gain)

    await Tone.loaded()

    player.playbackRate = bpm / layer.bpm

    const ref: PlayerRef = { player, gain, originalBpm: layer.bpm, loaded: true }
    playersRef.current[id] = ref
    return ref
  }, [bpm])

  const toggleLayer = useCallback(async (id: string) => {
    playClick()

    setLayers(prev => {
      const current = prev[id]!
      const newEnabled = !current.enabled
      return { ...prev, [id]: { ...current, enabled: newEnabled } }
    })
  }, [playClick])

  // Sync player state whenever layers change
  useEffect(() => {
    for (const [id, state] of Object.entries(layers)) {
      const ref = playersRef.current[id]

      if (state.enabled) {
        if (!ref || !ref.loaded) {
          setLoadingId(id)
          ensurePlayer(id).then(r => {
            setLoadingId(null)
            r.gain.gain.cancelScheduledValues(Tone.now())
            r.gain.gain.setValueAtTime(state.volume, Tone.now())
            if (r.player.state !== 'started') {
              r.player.start()
            }
          })
        } else {
          ref.gain.gain.cancelScheduledValues(Tone.now())
          ref.gain.gain.setValueAtTime(state.volume, Tone.now())
          if (ref.player.state !== 'started') {
            ref.player.start()
          }
        }
      } else if (ref?.loaded) {
        ref.gain.gain.cancelScheduledValues(Tone.now())
        ref.gain.gain.linearRampToValueAtTime(0, Tone.now() + 0.15)
      }
    }
  }, [layers, ensurePlayer])

  const setVolume = useCallback((id: string, volume: number) => {
    setLayers(prev => ({ ...prev, [id]: { ...prev[id]!, volume } }))
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
      top: 60,
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
        {AMBIENT_LAYERS.map(layer => {
          const state = layers[layer.id]!
          const isLoading = loadingId === layer.id
          return (
            <div key={layer.id} style={styles.row}>
              <input
                type="checkbox"
                checked={state.enabled}
                onChange={() => toggleLayer(layer.id)}
                disabled={isLoading}
                id={`amb-${layer.id}`}
              />
              <label htmlFor={`amb-${layer.id}`} style={styles.label}>
                {isLoading ? '...' : layer.name}
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(state.volume * 100)}
                onChange={e => setVolume(layer.id, Number(e.target.value) / 100)}
                disabled={!state.enabled}
                style={{ flex: 1, minWidth: 50 }}
              />
            </div>
          )
        })}
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
