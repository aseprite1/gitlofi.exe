import { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { Header } from './Header'
import { UsernameInput } from './UsernameInput'
import { SequencerGrid } from './SequencerGrid'
import { TransportControls } from './TransportControls'
import { LanguageBar } from './LanguageBar'
import { SampleInfo } from './SampleInfo'
import { YearSelector } from './YearSelector'
import { Taskbar } from './Taskbar'
import { Clippy } from './Clippy'
import { VuMeterWindow } from './VuMeterWindow'
import { CrtSettings, DEFAULT_EFFECTS, type CrtEffects } from './CrtSettings'
import { AmbientMixer } from './AmbientMixer'
import { useContributions } from '../hooks/useContributions'
import { useDrumSequencer } from '../hooks/useDrumSequencer'
import { contributionsToPattern } from '../lib/mapping'
import { fetchLanguageProfile, type LanguageProfile } from '../lib/languages'

export function App() {
  const { data, loading, error, load } = useContributions()
  const [langProfile, setLangProfile] = useState<LanguageProfile | null>(null)
  const [langLoading, setLangLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState('last')
  const [copied, setCopied] = useState(false)
  const [windowState, setWindowState] = useState<'normal' | 'minimized' | 'maximized'>('normal')
  const [crtEffects, setCrtEffects] = useState<CrtEffects>(DEFAULT_EFFECTS)
  const [vuMinimized, setVuMinimized] = useState(false)
  const [crtMinimized, setCrtMinimized] = useState(false)
  const [ambientMinimized, setAmbientMinimized] = useState(false)
  const [windowPos, setWindowPos] = useState({ x: 0, y: 0 })
  const [zOrder, setZOrder] = useState({ main: 100, vu: 200, crt: 201, ambient: 202 })
  const zCounterRef = useRef(300)

  const bringToFront = useCallback((win: 'main' | 'vu' | 'crt' | 'ambient') => {
    zCounterRef.current += 1
    setZOrder(prev => ({ ...prev, [win]: zCounterRef.current }))
  }, [])
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const usernameRef = useRef('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const u = params.get('u')
    const y = params.get('y')
    if (u) {
      usernameRef.current = u
      if (y) setSelectedYear(y)
      load(u, y ?? 'last')
      fetchLanguageProfile(u).then(setLangProfile).catch(() => setLangProfile(null))
    }
  }, [load])

  useEffect(() => {
    const body = document.body
    body.classList.toggle('crt-scanlines', crtEffects.scanlines)
    body.classList.toggle('crt-vignette', crtEffects.vignette)
    body.classList.toggle('crt-flicker', crtEffects.flicker)
    body.classList.toggle('crt-rgb-shift', crtEffects.rgbShift)
    body.classList.toggle('crt-noise', crtEffects.noise)
    body.classList.toggle('crt-dot-mask', crtEffects.dotMask)
    body.classList.toggle('crt-glow', crtEffects.glow)
  }, [crtEffects])

  const [overrides, setOverrides] = useState<Record<string, boolean>>({})

  const basePattern = useMemo(
    () => (data ? contributionsToPattern(data) : null),
    [data]
  )

  const pattern = useMemo(() => {
    if (!basePattern) return null
    const grid = basePattern.grid.map(row => [...row])
    for (const [key, active] of Object.entries(overrides)) {
      const [r, c] = key.split('-').map(Number)
      if (r != null && c != null && grid[r]) {
        grid[r]![c!] = active ? 0.75 : 0
      }
    }
    return { ...basePattern, grid }
  }, [basePattern, overrides])

  const handleCellToggle = useCallback((row: number, col: number) => {
    const key = `${row}-${col}`
    const originalVel = basePattern?.grid[row]?.[col] ?? 0
    const currentOverride = overrides[key]

    if (currentOverride !== undefined) {
      setOverrides(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    } else {
      setOverrides(prev => ({
        ...prev,
        [key]: originalVel === 0,
      }))
    }
  }, [basePattern, overrides])

  const handleReset = useCallback(() => {
    setOverrides({})
  }, [])

  const sequencer = useDrumSequencer(pattern, langProfile?.dominantFamily)

  const handleSubmit = useCallback(
    async (username: string) => {
      usernameRef.current = username
      sequencer.stop()
      const params = new URLSearchParams()
      params.set('u', username)
      if (selectedYear !== 'last') params.set('y', selectedYear)
      window.history.replaceState(null, '', `?${params}`)
      load(username, selectedYear)
      setLangLoading(true)
      try {
        const profile = await fetchLanguageProfile(username)
        setLangProfile(profile)
      } catch {
        setLangProfile(null)
      } finally {
        setLangLoading(false)
      }
    },
    [sequencer, load, selectedYear]
  )

  const handleYearChange = useCallback(
    (year: string) => {
      setSelectedYear(year)
      if (usernameRef.current) {
        sequencer.stop()
        const params = new URLSearchParams()
        params.set('u', usernameRef.current)
        if (year !== 'last') params.set('y', year)
        window.history.replaceState(null, '', `?${params}`)
        load(usernameRef.current, year)
      }
    },
    [sequencer, load]
  )

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    if (windowState === 'maximized') return
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: windowPos.x, origY: windowPos.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [windowState, windowPos])

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    setWindowPos({
      x: dragRef.current.origX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.origY + (e.clientY - dragRef.current.startY),
    })
  }, [])

  const handleDragEnd = useCallback(() => {
    dragRef.current = null
  }, [])

  const getShareUrl = () => {
    const params = new URLSearchParams()
    if (data) params.set('u', data.username)
    if (selectedYear !== 'last') params.set('y', selectedYear)
    return `${window.location.origin}${window.location.pathname}?${params}`
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleShareTwitter = () => {
    if (!data) return
    const text = `Listen to @${data.username}'s GitHub contributions as a lo-fi beat 🎹`
    const url = getShareUrl()
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    )
  }

  return (
    <>
      {/* CRT overlay layers */}
      <div className="crt-scanlines-overlay" />
      <div className="crt-vignette-overlay" />
      <div className="crt-noise-overlay" />
      <div className="crt-dot-mask-overlay" />

      <CrtSettings effects={crtEffects} onChange={setCrtEffects} minimized={crtMinimized} onMinimize={() => setCrtMinimized(m => !m)} zIndex={zOrder.crt} onFocus={() => bringToFront('crt')} />
      <AmbientMixer minimized={ambientMinimized} onMinimize={() => setAmbientMinimized(m => !m)} zIndex={zOrder.ambient} onFocus={() => bringToFront('ambient')} bpm={sequencer.bpm} />
      <div style={styles.desktop}>
        {windowState !== 'minimized' && (
        <div className="window" onPointerDown={() => bringToFront('main')} style={{
          ...styles.mainWindow,
          zIndex: zOrder.main,
          ...(windowState === 'maximized' ? styles.maximized : {
            transform: `translate(${windowPos.x}px, ${windowPos.y}px)`,
          }),
        }}>
          <div
            className="title-bar"
            onDoubleClick={() => setWindowState(s => s === 'maximized' ? 'normal' : 'maximized')}
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            style={{ cursor: windowState === 'maximized' ? 'default' : 'grab', touchAction: 'none' }}
          >
            <div className="title-bar-text">gitlofi.exe — GitHub Lo-Fi Beat Generator</div>
            <div className="title-bar-controls">
              <button aria-label="Minimize" onClick={() => setWindowState('minimized')} />
              <button aria-label="Maximize" onClick={() => setWindowState(s => s === 'maximized' ? 'normal' : 'maximized')} />
              <button aria-label="Close" onClick={() => setWindowState('minimized')} />
            </div>
          </div>

          <div style={styles.body}>
            <Header />
            <UsernameInput onSubmit={handleSubmit} loading={loading || langLoading} />

            {error && (
              <div style={styles.error}>⚠️ {error}</div>
            )}

            {data && pattern && (
              <div style={styles.content}>
                {/* Status bar */}
                <div style={styles.statusRow}>
                  <b>@{data.username}</b>
                  <span style={{ color: '#808080' }}>
                    — {data.totalContributions.toLocaleString()} contributions
                  </span>
                </div>

                <YearSelector
                  selectedYear={selectedYear}
                  onSelect={handleYearChange}
                  loading={loading}
                />

                {/* Two column: Language + Transport */}
                <div style={styles.columns}>
                  {langProfile && langProfile.entries.length > 0 && (
                    <fieldset style={styles.fieldset}>
                      <legend>Languages</legend>
                      <LanguageBar profile={langProfile} />
                    </fieldset>
                  )}

                  <fieldset style={styles.fieldset}>
                    <legend>Transport</legend>
                    <TransportControls
                      isPlaying={sequencer.isPlaying}
                      bpm={sequencer.bpm}
                      volume={sequencer.volume}
                      onPlay={sequencer.play}
                      onStop={sequencer.stop}
                      onBpmChange={sequencer.setBpm}
                      onVolumeChange={sequencer.setVolume}
                      loading={sequencer.loading}
                    />
                  </fieldset>
                </div>

                {/* Sequencer */}
                <fieldset>
                  <legend>
                    Sequencer — Contribution Grid
                    {Object.keys(overrides).length > 0 && (
                      <button onClick={handleReset} style={{ marginLeft: 8, fontSize: 10 }}>
                        Reset
                      </button>
                    )}
                  </legend>
                  <SequencerGrid
                    pattern={pattern}
                    currentStep={sequencer.currentStep}
                    data={data}
                    overrides={overrides}
                    onCellClick={handleCellToggle}
                  />
                </fieldset>

                {/* Now Playing */}
                {sequencer.activeKit && (
                  <fieldset>
                    <legend>♪ Now Playing</legend>
                    <SampleInfo
                      kit={sequencer.activeKit}
                      vinylFile={sequencer.activeVinyl}
                    />
                  </fieldset>
                )}

                {/* Actions */}
                <fieldset>
                  <legend>Share</legend>
                  <div className="field-row" style={{ justifyContent: 'center', gap: 6, padding: '4px 0', flexWrap: 'wrap' }}>
                    <button
                      disabled={!data}
                      onClick={() => {
                        if (data) {
                          const url = `https://github.com/${encodeURIComponent(data.username)}`
                          window.open(url, '_blank')
                        }
                      }}
                    >
                      🔗 View on GitHub
                    </button>
                    <button onClick={handleCopyLink} disabled={!data}>
                      {copied ? '✅ Copied!' : '📋 Copy Link'}
                    </button>
                    <button onClick={handleShareTwitter} disabled={!data}>
                      🐦 Share on X
                    </button>
                  </div>
                </fieldset>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <p>All audio samples used in this application are licensed for use in multimedia productions.</p>
            <p>This project is for entertainment and creative purposes only.</p>
            <p style={{ marginTop: 4 }}>
              Built by <a href="https://github.com/aseprite1" target="_blank" rel="noopener" style={styles.link}>@aseprite1</a>
              {' · '}
              <a href="https://github.com/aseprite1/gitlofi.exe" target="_blank" rel="noopener" style={styles.link}>GitHub</a>
            </p>
            <p style={{ color: '#a09080', marginTop: 2 }}>© 2026 gitlofi.exe. Not affiliated with GitHub, Inc.</p>
          </div>

          {/* Window status bar */}
          <div style={styles.statusBar}>
            <div className="status-bar-field" style={{ flex: 1 }}>
              {sequencer.isPlaying
                ? `▶ Playing — Step ${sequencer.currentStep + 1}/${pattern?.cols ?? 0}`
                : 'Ready'}
            </div>
            <div className="status-bar-field">BPM: {sequencer.bpm}</div>
            <div className="status-bar-field">Vol: {Math.round(sequencer.volume * 100)}%</div>
          </div>
        </div>
        )}
      </div>

      <VuMeterWindow meterLevel={sequencer.meterLevel} isPlaying={sequencer.isPlaying} minimized={vuMinimized} onMinimize={() => setVuMinimized(m => !m)} zIndex={zOrder.vu} onFocus={() => bringToFront('vu')} />
      <Clippy />
      <Taskbar
        isPlaying={sequencer.isPlaying}
        windowState={windowState}
        vuMinimized={vuMinimized}
        crtMinimized={crtMinimized}
        ambientMinimized={ambientMinimized}
        onRestore={() => setWindowState('normal')}
        onVuToggle={() => setVuMinimized(m => !m)}
        onCrtToggle={() => setCrtMinimized(m => !m)}
        onAmbientToggle={() => setAmbientMinimized(m => !m)}
      />
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  desktop: {
    width: '100%',
    maxWidth: 960,
    padding: '8px 0',
    animation: 'fadeIn 0.3s ease-out',
  },
  mainWindow: {
    width: '100%',
    position: 'relative' as const,
  },
  maximized: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 28,
    maxWidth: 'none',
    borderRadius: 0,
    overflow: 'auto',
  },
  body: {
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  error: {
    padding: '6px 8px',
    background: '#fff0f0',
    border: '1px solid #c04040',
    fontSize: 12,
    color: '#c04040',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  statusRow: {
    fontSize: 13,
    padding: '2px 0',
  },
  columns: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  fieldset: {
    flex: 1,
    minWidth: 280,
  },
  footer: {
    padding: '10px 12px',
    borderTop: '1px solid #808080',
    fontSize: 10,
    color: '#8b7355',
    textAlign: 'center',
    lineHeight: 1.6,
  },
  link: {
    color: '#5c4a32',
    fontWeight: 'bold',
  },
  statusBar: {
    display: 'flex',
    gap: 2,
    padding: '2px 4px',
    borderTop: '2px solid #808080',
    fontSize: 11,
  },
}
