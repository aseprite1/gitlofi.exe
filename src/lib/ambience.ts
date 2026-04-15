import * as Tone from 'tone'
import type { Genre } from './genres'

export interface AmbienceLayer {
  start: () => void
  stop: () => void
  dispose: () => void
}

function createLofiAmbience(output: Tone.InputNode): AmbienceLayer {
  const filter = new Tone.Filter(800, 'lowpass', -24).connect(output)
  const reverb = new Tone.Reverb({ decay: 6, wet: 0.7 }).connect(filter)
  const chorus = new Tone.Chorus(0.3, 3.5, 0.7).connect(reverb)

  const pad = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 2,
    modulationIndex: 1.5,
    oscillator: { type: 'sine' },
    envelope: { attack: 2, decay: 3, sustain: 0.6, release: 4 },
    modulation: { type: 'triangle' },
    modulationEnvelope: { attack: 1, decay: 2, sustain: 0.4, release: 3 },
    volume: -14,
  }).connect(chorus)

  const noiseGain = new Tone.Gain(0.06).connect(output)
  const noiseFilter = new Tone.Filter(600, 'lowpass').connect(noiseGain)
  const vinylNoise = new Tone.Noise('brown').connect(noiseFilter)

  const chords = [
    ['D3', 'F3', 'A3', 'C4'],
    ['Bb2', 'D3', 'F3', 'A3'],
    ['G2', 'Bb2', 'D3', 'F3'],
    ['A2', 'C3', 'E3', 'G3'],
  ]

  let chordIndex = 0
  let loop: Tone.Loop | null = null

  return {
    start: () => {
      vinylNoise.start()
      pad.triggerAttack(chords[0]!, Tone.now(), 0.5)
      loop = new Tone.Loop((time) => {
        pad.releaseAll(time)
        chordIndex = (chordIndex + 1) % chords.length
        pad.triggerAttack(chords[chordIndex]!, time + 0.1, 0.5)
      }, '2m')
      loop.start('1m')
    },
    stop: () => {
      pad.releaseAll()
      vinylNoise.stop()
      loop?.stop()
    },
    dispose: () => {
      loop?.dispose()
      pad.dispose()
      vinylNoise.dispose()
      noiseFilter.dispose()
      noiseGain.dispose()
      chorus.dispose()
      reverb.dispose()
      filter.dispose()
    },
  }
}

function createHiphopAmbience(output: Tone.InputNode): AmbienceLayer {
  const filter = new Tone.Filter(400, 'lowpass', -12).connect(output)
  const reverb = new Tone.Reverb({ decay: 3, wet: 0.3 }).connect(filter)

  const bass = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    filter: { Q: 2, type: 'lowpass', frequency: 200 },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.7, release: 0.8 },
    filterEnvelope: { attack: 0.06, decay: 0.2, sustain: 0.5, release: 0.5, baseFrequency: 80, octaves: 1.5 },
    volume: -12,
  }).connect(reverb)

  const notes = ['C2', 'C2', 'Eb2', 'G1']
  let noteIndex = 0
  let loop: Tone.Loop | null = null

  return {
    start: () => {
      loop = new Tone.Loop((time) => {
        bass.triggerAttackRelease(notes[noteIndex % notes.length]!, '2n', time, 0.6)
        noteIndex++
      }, '1m')
      loop.start(0)
    },
    stop: () => {
      loop?.stop()
      noteIndex = 0
    },
    dispose: () => {
      loop?.dispose()
      bass.dispose()
      reverb.dispose()
      filter.dispose()
    },
  }
}

function createTechnoAmbience(output: Tone.InputNode): AmbienceLayer {
  const reverb = new Tone.Reverb({ decay: 4, wet: 0.5 }).connect(output)
  const delay = new Tone.PingPongDelay('8n.', 0.3).connect(reverb)
  delay.wet.value = 0.25

  const autoFilter = new Tone.AutoFilter({
    frequency: 0.08,
    baseFrequency: 200,
    octaves: 4,
    wet: 0.4,
  }).connect(output)

  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth4' },
    envelope: { attack: 1.5, decay: 2, sustain: 0.3, release: 3 },
    volume: -18,
  })
  pad.connect(delay)
  pad.connect(autoFilter)

  const chords = [
    ['A2', 'E3', 'A3'],
    ['A2', 'D3', 'G3'],
  ]

  let chordIndex = 0
  let loop: Tone.Loop | null = null

  return {
    start: () => {
      autoFilter.start()
      pad.triggerAttack(chords[0]!, Tone.now(), 0.4)
      loop = new Tone.Loop((time) => {
        pad.releaseAll(time)
        chordIndex = (chordIndex + 1) % chords.length
        pad.triggerAttack(chords[chordIndex]!, time + 0.05, 0.4)
      }, '4m')
      loop.start('2m')
    },
    stop: () => {
      pad.releaseAll()
      autoFilter.stop()
      loop?.stop()
    },
    dispose: () => {
      loop?.dispose()
      pad.dispose()
      autoFilter.dispose()
      delay.dispose()
      reverb.dispose()
    },
  }
}

function createJazzAmbience(output: Tone.InputNode): AmbienceLayer {
  const reverb = new Tone.Reverb({ decay: 5, wet: 0.5 }).connect(output)

  const piano = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle8' },
    envelope: { attack: 0.02, decay: 1.5, sustain: 0.1, release: 2 },
    volume: -16,
  }).connect(reverb)

  const bass = new Tone.MonoSynth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.05, decay: 0.4, sustain: 0.5, release: 0.6 },
    volume: -14,
  }).connect(reverb)

  const voicings = [
    { chord: ['D3', 'F#3', 'A3', 'C4'], bass: 'D2' },
    { chord: ['G3', 'B3', 'D4', 'F4'], bass: 'G2' },
    { chord: ['C3', 'E3', 'G3', 'B3'], bass: 'C2' },
    { chord: ['F3', 'A3', 'C4', 'E4'], bass: 'F2' },
  ]

  let voicingIndex = 0
  let loop: Tone.Loop | null = null

  return {
    start: () => {
      loop = new Tone.Loop((time) => {
        const v = voicings[voicingIndex % voicings.length]!
        piano.triggerAttackRelease(v.chord, '2n', time, 0.4)
        bass.triggerAttackRelease(v.bass, '2n.', time, 0.5)
        voicingIndex++
      }, '1m')
      loop.start(0)
    },
    stop: () => {
      piano.releaseAll()
      loop?.stop()
      voicingIndex = 0
    },
    dispose: () => {
      loop?.dispose()
      piano.dispose()
      bass.dispose()
      reverb.dispose()
    },
  }
}

export function createAmbience(genre: Genre, output: Tone.InputNode): AmbienceLayer {
  switch (genre) {
    case 'lofi': return createLofiAmbience(output)
    case 'hiphop': return createHiphopAmbience(output)
    case 'techno': return createTechnoAmbience(output)
    case 'jazz': return createJazzAmbience(output)
  }
}
