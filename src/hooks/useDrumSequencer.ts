import { useRef, useState, useCallback, useEffect } from 'react'
import * as Tone from 'tone'
import type { SequencerPattern, DrumInstrument } from '../types'
import { createSampleKit, createBackgroundLayer, type BackgroundLayer } from '../lib/sampleEngine'
import type { MusicKit } from '../lib/sampleManifest'
import type { LanguageFamily } from '../lib/languages'

export function useDrumSequencer(pattern: SequencerPattern | null, languageFamily?: LanguageFamily) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [bpm, setBpmState] = useState(80)
  const [volume, setVolumeState] = useState(0.8)
  const [loading, setLoading] = useState(false)
  const [activeKit, setActiveKit] = useState<MusicKit | null>(null)
  const [activeVinyl, setActiveVinyl] = useState<string | null>(null)
  const [meterLevel, setMeterLevel] = useState(0)

  const instrumentsRef = useRef<DrumInstrument[] | null>(null)
  const channelRef = useRef<Tone.Channel | null>(null)
  const meterRef = useRef<Tone.Meter | null>(null)
  const rafRef = useRef<number>(0)
  const sequenceRef = useRef<Tone.Sequence | null>(null)
  const bgRef = useRef<BackgroundLayer | null>(null)
  const patternRef = useRef<SequencerPattern | null>(null)

  patternRef.current = pattern

  useEffect(() => {
    Tone.getTransport().bpm.value = bpm
    Tone.getTransport().swing = 0.2
    Tone.getTransport().swingSubdivision = '8n'
    bgRef.current?.setBpm(bpm)
  }, [bpm])

  useEffect(() => {
    if (channelRef.current) {
      channelRef.current.volume.value = volume > 0 ? 20 * Math.log10(volume) : -Infinity
    }
  }, [volume])

  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    sequenceRef.current?.dispose()
    sequenceRef.current = null
    instrumentsRef.current?.forEach(i => i.dispose())
    instrumentsRef.current = null
    bgRef.current?.stop()
    bgRef.current?.dispose()
    bgRef.current = null
    meterRef.current?.dispose()
    meterRef.current = null
    channelRef.current?.dispose()
    channelRef.current = null
    setMeterLevel(0)
  }, [])

  useEffect(() => () => cleanup(), [cleanup])

  const play = useCallback(async () => {
    if (!patternRef.current) return

    await Tone.start()
    setLoading(true)
    cleanup()

    const meter = new Tone.Meter({ smoothing: 0.8 })
    const channel = new Tone.Channel().toDestination()
    channel.connect(meter)
    channel.volume.value = volume > 0 ? 20 * Math.log10(volume) : -Infinity
    channelRef.current = channel
    meterRef.current = meter

    const updateMeter = () => {
      const val = meter.getValue()
      const db = typeof val === 'number' ? val : val[0] ?? -Infinity
      const normalized = Math.max(0, Math.min(1, (db + 60) / 60))
      setMeterLevel(normalized)
      rafRef.current = requestAnimationFrame(updateMeter)
    }
    rafRef.current = requestAnimationFrame(updateMeter)

    try {
      const [kit, bg] = await Promise.all([
        createSampleKit(channel, languageFamily),
        createBackgroundLayer(channel, languageFamily, bpm),
      ])

      instrumentsRef.current = kit.instruments
      bgRef.current = bg
      setActiveKit(bg.kit)
      setActiveVinyl(bg.vinylFile)

      const cols = patternRef.current!.cols
      const steps = Array.from({ length: cols }, (_, i) => i)

      const seq = new Tone.Sequence(
        (time, step) => {
          setCurrentStep(step)
          const p = patternRef.current
          if (!p) return
          for (let row = 0; row < p.rows; row++) {
            const vel = p.grid[row]?.[step] ?? 0
            if (vel > 0) {
              kit.instruments[row]?.trigger(vel, time)
            }
          }
        },
        steps,
        '8n'
      )

      sequenceRef.current = seq
      Tone.getTransport().bpm.value = bpm
      seq.start(0)
      bg.start()
      Tone.getTransport().start()
      setIsPlaying(true)
    } finally {
      setLoading(false)
    }
  }, [bpm, volume, cleanup])

  const stop = useCallback(() => {
    Tone.getTransport().stop()
    sequenceRef.current?.stop()
    bgRef.current?.stop()
    setIsPlaying(false)
    setCurrentStep(-1)
  }, [])

  const setBpm = useCallback((v: number) => setBpmState(v), [])
  const setVolume = useCallback((v: number) => setVolumeState(v), [])

  return {
    isPlaying, currentStep, bpm, setBpm, volume, setVolume,
    play, stop, loading, activeKit, activeVinyl, meterLevel,
  }
}
