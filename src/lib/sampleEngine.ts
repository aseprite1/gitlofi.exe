import * as Tone from 'tone'
import type { DrumInstrument } from '../types'
import {
  getDrumSamplePath,
  MUSIC_KITS,
  VINYL_LOOPS,
  BASS_LOOPS,
  getMusicLoopPath,
  getPresetSamplePath,
  pickKitByLanguageMoods,
  LANGUAGE_PRESETS,
  type MusicKit,
  type LanguageDrumPreset,
} from './sampleManifest'
import type { LanguageFamily } from './languages'

export interface SampleKit {
  instruments: DrumInstrument[]
  dispose: () => void
}

export interface BackgroundLayer {
  start: () => void
  stop: () => void
  dispose: () => void
  setBpm: (bpm: number) => void
  kit: MusicKit
  vinylFile: string
}

interface DrumSlot {
  category: string
  name: string
  dayName: string
}

const DRUM_SLOTS: DrumSlot[] = [
  { category: 'kicks', name: 'Kick', dayName: 'Sun' },
  { category: 'hats_closed', name: 'Hat-C', dayName: 'Mon' },
  { category: 'percussion', name: 'Shaker', dayName: 'Tue' },
  { category: 'snares', name: 'Snare', dayName: 'Wed' },
  { category: 'hats_open', name: 'Hat-O', dayName: 'Thu' },
  { category: 'claps', name: 'Clap', dayName: 'Fri' },
  { category: 'percussion', name: 'Rim', dayName: 'Sat' },
]

function resolveSamplePath(slot: DrumSlot, preset?: LanguageDrumPreset): string {
  if (preset) {
    const files = preset[slot.category as keyof LanguageDrumPreset]
    if (Array.isArray(files) && files.length > 0) {
      return getPresetSamplePath(slot.category, files)
    }
  }
  return getDrumSamplePath(slot.category, 0)
}

export async function createSampleKit(
  output: Tone.InputNode,
  languageFamily?: LanguageFamily,
): Promise<SampleKit> {
  const players: Tone.Player[] = []
  const instruments: DrumInstrument[] = []
  const preset = languageFamily ? LANGUAGE_PRESETS[languageFamily] : undefined

  const loadPromises = DRUM_SLOTS.map(async (slot) => {
    const path = resolveSamplePath(slot, preset)
    if (!path) return null

    const drumGain = new Tone.Gain(0.75).connect(output)
    const buffer = new Tone.ToneAudioBuffer(path)
    players.push(drumGain as unknown as Tone.Player)

    await Tone.loaded()

    return {
      name: slot.name,
      dayName: slot.dayName,
      trigger: (velocity: number, time: number) => {
        if (buffer.loaded) {
          const velGain = new Tone.Gain(velocity * 0.8).connect(drumGain)
          const source = new Tone.BufferSource(buffer).connect(velGain)
          source.start(time)
          source.onended = () => { source.dispose(); velGain.dispose() }
        }
      },
      dispose: () => { buffer.dispose(); drumGain.dispose() },
    } satisfies DrumInstrument
  })

  const results = await Promise.all(loadPromises)
  for (const inst of results) {
    if (inst) instruments.push(inst)
  }

  return {
    instruments,
    dispose: () => players.forEach(p => p.dispose()),
  }
}

export async function createBackgroundLayer(
  output: Tone.InputNode,
  languageFamily?: LanguageFamily,
  initialBpm: number = 80,
): Promise<BackgroundLayer> {
  const preset = languageFamily ? LANGUAGE_PRESETS[languageFamily] : undefined
  const selectedKit = preset
    ? pickKitByLanguageMoods(preset.moods)
    : MUSIC_KITS[Math.floor(Math.random() * MUSIC_KITS.length)]!

  const vinyl = VINYL_LOOPS[Math.floor(Math.random() * VINYL_LOOPS.length)]!
  const matchingBass = BASS_LOOPS.find(b => b.key === selectedKit.key)

  const disposables: { dispose: () => void }[] = []
  const loopPlayers: { player: Tone.Player; originalBpm: number }[] = []

  const reverbNode = new Tone.Reverb({ decay: 4, wet: 0.35 }).connect(output)
  disposables.push(reverbNode)

  const musicGain = new Tone.Gain(0.55).connect(reverbNode)
  disposables.push(musicGain)

  const vinylGain = new Tone.Gain(0.15).connect(output)
  disposables.push(vinylGain)

  const bassGain = new Tone.Gain(0.45).connect(reverbNode)
  disposables.push(bassGain)

  const fullPath = getMusicLoopPath(selectedKit.layers['full'] ?? '')
  if (fullPath) {
    const musicPlayer = new Tone.Player({
      url: fullPath,
      loop: true,
      loopStart: 0,
    }).connect(musicGain)
    disposables.push(musicPlayer)
    loopPlayers.push({ player: musicPlayer, originalBpm: selectedKit.bpm })
  }

  if (selectedKit.layers['keys']) {
    const keysPath = getMusicLoopPath(selectedKit.layers['keys'])
    const keysPlayer = new Tone.Player({
      url: keysPath,
      loop: true,
      volume: -8,
    }).connect(musicGain)
    disposables.push(keysPlayer)
    loopPlayers.push({ player: keysPlayer, originalBpm: selectedKit.bpm })
  }

  const vinylPlayer = new Tone.Player({
    url: vinyl.path,
    loop: true,
  }).connect(vinylGain)
  disposables.push(vinylPlayer)
  loopPlayers.push({ player: vinylPlayer, originalBpm: vinyl.bpm })

  if (matchingBass) {
    const bassPlayer = new Tone.Player({
      url: matchingBass.path,
      loop: true,
    }).connect(bassGain)
    disposables.push(bassPlayer)
    loopPlayers.push({ player: bassPlayer, originalBpm: matchingBass.bpm })
  }

  await Tone.loaded()

  function applyBpm(bpm: number) {
    for (const { player, originalBpm } of loopPlayers) {
      if (player.loaded) {
        player.playbackRate = bpm / originalBpm
      }
    }
  }

  applyBpm(initialBpm)

  return {
    start: () => {
      for (const { player } of loopPlayers) {
        if (player.loaded && player.state !== 'started') {
          player.start()
        }
      }
    },
    stop: () => {
      for (const { player } of loopPlayers) {
        if (player.state === 'started') {
          player.stop()
        }
      }
    },
    dispose: () => {
      disposables.forEach(d => d.dispose())
    },
    setBpm: applyBpm,
    kit: selectedKit,
    vinylFile: vinyl.path.split('/').pop() ?? '',
  }
}
