import * as Tone from 'tone'
import type { DrumInstrument } from '../types'
import type { GenreConfig, InstrumentConfig } from './genres'

function buildInstrument(
  config: InstrumentConfig,
  output: Tone.InputNode
): { trigger: (vel: number, time: number) => void; dispose: () => void } {
  const synths: { dispose: () => void }[] = []

  let filter: Tone.Filter | null = null
  let dist: Tone.Distortion | null = null
  let dest: Tone.InputNode = output

  if (config.filterFreq) {
    filter = new Tone.Filter(config.filterFreq, 'lowpass').connect(dest)
    dest = filter
    synths.push(filter)
  }

  if (config.distortion && config.distortion > 0) {
    dist = new Tone.Distortion(config.distortion).connect(dest)
    dest = dist
    synths.push(dist)
  }

  switch (config.type) {
    case 'membrane': {
      const synth = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: config.decay > 0.5 ? 6 : 4,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: config.decay, sustain: 0, release: config.decay * 0.3 },
      }).connect(dest)
      synths.push(synth)
      return {
        trigger: (vel, time) => synth.triggerAttackRelease(config.pitch ?? 'C2', `${config.decay}`, time, vel),
        dispose: () => synths.forEach(s => s.dispose()),
      }
    }
    case 'noise': {
      const synth = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: config.decay, sustain: 0, release: config.decay * 0.2 },
      }).connect(dest)
      synths.push(synth)
      return {
        trigger: (vel, time) => synth.triggerAttackRelease(config.decay, time, vel),
        dispose: () => synths.forEach(s => s.dispose()),
      }
    }
    case 'metal': {
      const synth = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: config.decay, release: config.decay * 0.3 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
      }).connect(dest)
      synths.push(synth)
      return {
        trigger: (vel, time) => synth.triggerAttackRelease(config.decay, time, vel * 0.5),
        dispose: () => synths.forEach(s => s.dispose()),
      }
    }
    case 'fm': {
      const synth = new Tone.FMSynth({
        harmonicity: 8,
        modulationIndex: 12,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: config.decay, sustain: 0, release: config.decay * 0.2 },
        modulation: { type: 'square' },
        modulationEnvelope: { attack: 0.001, decay: config.decay * 0.5, sustain: 0, release: 0.01 },
      }).connect(dest)
      synths.push(synth)
      return {
        trigger: (vel, time) => synth.triggerAttackRelease(config.pitch ?? 'C3', config.decay, time, vel * 0.6),
        dispose: () => synths.forEach(s => s.dispose()),
      }
    }
  }
}

export function createDrumKit(output: Tone.InputNode, genreConfig?: GenreConfig): {
  instruments: DrumInstrument[]
  reverb: Tone.Reverb
  delay: Tone.FeedbackDelay
} {
  const reverb = new Tone.Reverb({
    decay: genreConfig?.reverbMix ? genreConfig.reverbMix * 6 : 1.5,
    wet: genreConfig?.reverbMix ?? 0.15,
  }).connect(output)

  const delay = new Tone.FeedbackDelay({
    delayTime: '8n.',
    feedback: 0.2,
    wet: genreConfig?.delayMix ?? 0.1,
  }).connect(output)

  const dryWet = new Tone.Channel().fan(reverb, delay, output)

  const configs = genreConfig?.instruments ?? [
    { name: 'Kick', dayName: 'Sun', type: 'membrane' as const, pitch: 'C1', decay: 0.4 },
    { name: 'Snare', dayName: 'Mon', type: 'noise' as const, decay: 0.15 },
    { name: 'HH-C', dayName: 'Tue', type: 'metal' as const, decay: 0.05 },
    { name: 'HH-O', dayName: 'Wed', type: 'metal' as const, decay: 0.3 },
    { name: 'Tom-L', dayName: 'Thu', type: 'membrane' as const, pitch: 'G1', decay: 0.3 },
    { name: 'Tom-M', dayName: 'Fri', type: 'membrane' as const, pitch: 'D2', decay: 0.25 },
    { name: 'Clap', dayName: 'Sat', type: 'noise' as const, decay: 0.1 },
  ]

  const instruments: DrumInstrument[] = configs.map(config => {
    const inst = buildInstrument(config, dryWet)
    return {
      name: config.name,
      dayName: config.dayName,
      trigger: inst.trigger,
      dispose: inst.dispose,
    }
  })

  return { instruments, reverb, delay }
}
