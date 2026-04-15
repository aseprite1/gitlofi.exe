import type { LanguageFamily } from './languages'

export type Genre = 'hiphop' | 'lofi' | 'techno' | 'jazz'

export interface GenreConfig {
  name: string
  label: string
  defaultBpm: number
  swing: number
  subdivision: string
  reverbMix: number
  delayMix: number
  instruments: InstrumentConfig[]
}

export interface InstrumentConfig {
  name: string
  dayName: string
  type: 'membrane' | 'noise' | 'metal' | 'fm'
  pitch?: string
  decay: number
  filterFreq?: number
  distortion?: number
}

const GENRE_CONFIGS: Record<Genre, GenreConfig> = {
  hiphop: {
    name: 'hiphop',
    label: 'Hip-Hop',
    defaultBpm: 90,
    swing: 0.3,
    subdivision: '8n',
    reverbMix: 0.15,
    delayMix: 0.1,
    instruments: [
      { name: '808 Kick', dayName: 'Sun', type: 'membrane', pitch: 'C1', decay: 0.8, distortion: 0.3 },
      { name: 'Snare', dayName: 'Mon', type: 'noise', decay: 0.2, filterFreq: 3000 },
      { name: 'Hi-Hat', dayName: 'Tue', type: 'metal', decay: 0.04 },
      { name: 'Open Hat', dayName: 'Wed', type: 'metal', decay: 0.25 },
      { name: '808 Bass', dayName: 'Thu', type: 'membrane', pitch: 'G1', decay: 1.0, distortion: 0.5 },
      { name: 'Clap', dayName: 'Fri', type: 'noise', decay: 0.15, filterFreq: 2500 },
      { name: 'Rim', dayName: 'Sat', type: 'membrane', pitch: 'C4', decay: 0.05 },
    ],
  },
  lofi: {
    name: 'lofi',
    label: 'Lo-Fi',
    defaultBpm: 75,
    swing: 0.2,
    subdivision: '8n',
    reverbMix: 0.45,
    delayMix: 0.25,
    instruments: [
      { name: 'Dusty Kick', dayName: 'Sun', type: 'membrane', pitch: 'D1', decay: 0.4, filterFreq: 800 },
      { name: 'Snare', dayName: 'Mon', type: 'noise', decay: 0.25, filterFreq: 2000 },
      { name: 'Hat', dayName: 'Tue', type: 'metal', decay: 0.03, filterFreq: 3000 },
      { name: 'Shaker', dayName: 'Wed', type: 'noise', decay: 0.06, filterFreq: 5000 },
      { name: 'Vinyl', dayName: 'Thu', type: 'noise', decay: 0.5, filterFreq: 1000 },
      { name: 'Tom', dayName: 'Fri', type: 'membrane', pitch: 'A2', decay: 0.35 },
      { name: 'Click', dayName: 'Sat', type: 'membrane', pitch: 'E4', decay: 0.03 },
    ],
  },
  techno: {
    name: 'techno',
    label: 'Techno',
    defaultBpm: 132,
    swing: 0,
    subdivision: '16n',
    reverbMix: 0.2,
    delayMix: 0.15,
    instruments: [
      { name: 'Kick', dayName: 'Sun', type: 'membrane', pitch: 'C1', decay: 0.3, distortion: 0.1 },
      { name: 'Clap', dayName: 'Mon', type: 'noise', decay: 0.12, filterFreq: 4000 },
      { name: 'CH', dayName: 'Tue', type: 'metal', decay: 0.02 },
      { name: 'OH', dayName: 'Wed', type: 'metal', decay: 0.15 },
      { name: 'Perc', dayName: 'Thu', type: 'fm', pitch: 'A3', decay: 0.1 },
      { name: 'Ride', dayName: 'Fri', type: 'metal', decay: 0.4 },
      { name: 'Zap', dayName: 'Sat', type: 'fm', pitch: 'C5', decay: 0.06 },
    ],
  },
  jazz: {
    name: 'jazz',
    label: 'Jazz',
    defaultBpm: 110,
    swing: 0.55,
    subdivision: '8n',
    reverbMix: 0.35,
    delayMix: 0.05,
    instruments: [
      { name: 'Kick', dayName: 'Sun', type: 'membrane', pitch: 'D1', decay: 0.25 },
      { name: 'Brush', dayName: 'Mon', type: 'noise', decay: 0.3, filterFreq: 1800 },
      { name: 'Ride', dayName: 'Tue', type: 'metal', decay: 0.6 },
      { name: 'Bell', dayName: 'Wed', type: 'metal', decay: 0.8 },
      { name: 'Floor Tom', dayName: 'Thu', type: 'membrane', pitch: 'F1', decay: 0.4 },
      { name: 'Cross Stick', dayName: 'Fri', type: 'membrane', pitch: 'B3', decay: 0.04 },
      { name: 'Splash', dayName: 'Sat', type: 'metal', decay: 1.0 },
    ],
  },
}

const LANGUAGE_TWEAKS: Record<LanguageFamily, (config: GenreConfig) => GenreConfig> = {
  systems: (config) => ({
    ...config,
    instruments: config.instruments.map(i => ({
      ...i,
      distortion: (i.distortion ?? 0) + 0.15,
      decay: i.decay * 0.7,
    })),
  }),
  web: (config) => ({
    ...config,
    delayMix: config.delayMix + 0.1,
    instruments: config.instruments.map(i => ({
      ...i,
      filterFreq: i.filterFreq ? i.filterFreq * 1.3 : undefined,
    })),
  }),
  scripting: (config) => ({
    ...config,
    swing: Math.min(config.swing + 0.1, 0.7),
    reverbMix: config.reverbMix + 0.05,
  }),
  data: (config) => ({
    ...config,
    instruments: config.instruments.map(i => ({
      ...i,
      decay: i.decay * 1.3,
    })),
    reverbMix: config.reverbMix + 0.15,
  }),
  mobile: (config) => ({
    ...config,
    instruments: config.instruments.map(i => ({
      ...i,
      filterFreq: i.filterFreq ? i.filterFreq * 0.8 : undefined,
      decay: i.decay * 0.85,
    })),
  }),
  mixed: (config) => config,
}

export function getGenreConfig(genre: Genre, languageFamily?: LanguageFamily): GenreConfig {
  const base = GENRE_CONFIGS[genre]
  if (!languageFamily || languageFamily === 'mixed') return base
  return LANGUAGE_TWEAKS[languageFamily](base)
}

export const ALL_GENRES: Genre[] = ['hiphop', 'lofi', 'techno', 'jazz']
