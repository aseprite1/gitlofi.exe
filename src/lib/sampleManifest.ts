export interface SampleInfo {
  path: string
  bpm?: number
  key?: string
  category: string
  tags: string[]
}

export interface MusicKit {
  name: string
  mood: string
  bpm: number
  key: string
  layers: Record<string, string>
}

const BASE = '/samples/lofi'

export function parseBpmAndKey(filename: string): { bpm?: number; key?: string } {
  const bpmMatch = filename.match(/_(\d{2,3})(?:_([A-G][#bm]?))?\.wav$/)
  return {
    bpm: bpmMatch?.[1] ? parseInt(bpmMatch[1]) : undefined,
    key: bpmMatch?.[2] ?? undefined,
  }
}

export function parseDrumTags(filename: string): string[] {
  const tags: string[] = []
  if (filename.includes('_low_')) tags.push('low')
  if (filename.includes('_mid_')) tags.push('mid')
  if (filename.includes('_high_')) tags.push('high')
  if (filename.includes('_deep_')) tags.push('deep')
  if (filename.includes('_distort_')) tags.push('distort')
  if (filename.includes('_punch_')) tags.push('punch')
  if (filename.includes('_loose_')) tags.push('loose')
  if (filename.includes('_tight_')) tags.push('tight')
  if (filename.includes('_bright_')) tags.push('bright')
  if (filename.includes('_noise_')) tags.push('noise')
  if (filename.includes('_click_')) tags.push('click')
  if (filename.includes('_synth_')) tags.push('synth')
  if (filename.includes('_live_')) tags.push('live')
  if (filename.includes('_closed_')) tags.push('closed')
  if (filename.includes('_open_')) tags.push('open')
  if (filename.includes('_lofi_')) tags.push('lofi')
  if (filename.includes('_short_')) tags.push('short')
  if (filename.includes('_layer_')) tags.push('layer')
  return tags
}

export const DRUM_SAMPLES: Record<string, string[]> = {
  kicks: [
    'lh_oneshot_kick_low_deep_donk.wav',
    'lh_oneshot_kick_low_deep_thicc.wav',
    'lh_oneshot_kick_low_distort_bruv.wav',
    'lh_oneshot_kick_low_distort_monst.wav',
    'lh_oneshot_kick_low_distort_rot.wav',
    'lh_oneshot_kick_low_distort_thump.wav',
    'lh_oneshot_kick_low_loose_biggin.wav',
    'lh_oneshot_kick_low_punch_amore.wav',
    'lh_oneshot_kick_low_punch_criz.wav',
    'lh_oneshot_kick_low_punch_round.wav',
  ],
  snares: [
    'lh_oneshot_snare_low_lofi_trash.wav',
    'lh_oneshot_snare_low_noise_brk.wav',
    'lh_oneshot_snare_mid_click_dil.wav',
    'lh_oneshot_snare_mid_compress_bev.wav',
    'lh_oneshot_snare_mid_layer_sp.wav',
  ],
  hats_closed: [
    'lh_oneshot_hat_closed_high_bright_bb.wav',
    'lh_oneshot_hat_closed_high_bright_dubz.wav',
    'lh_oneshot_hat_closed_high_bright_ghst.wav',
    'lh_oneshot_hat_closed_high_click_crick.wav',
    'lh_oneshot_hat_closed_high_click_tny.wav',
    'lh_oneshot_hat_closed_high_tight_laz.wav',
  ],
  hats_open: [
    'lh_oneshot_hat_open_high_bright_dream.wav',
    'lh_oneshot_hat_open_high_bright_lost.wav',
    'lh_oneshot_hat_open_high_noise_gator.wav',
  ],
  claps: [
    'lh_oneshot_clap_mid_click_nok.wav',
    'lh_oneshot_clap_mid_short_pop.wav',
    'lh_oneshot_clap_mid_short_rim.wav',
    'lh_oneshot_clap_low_click_dubz.wav',
  ],
  percussion: [
    'lh_oneshot_percussion_mid_click_micro.wav',
    'lh_oneshot_percussion_low_click_tok.wav',
    'lh_oneshot_percussion_mid_shake_reva.wav',
    'lh_oneshot_percussion_high_click_tick.wav',
    'lh_oneshot_percussion_low_click_crik.wav',
  ],
  crashes: [
    'lh_oneshot_crash_high_bright_hush.wav',
    'lh_oneshot_crash_high_noise_frgtn.wav',
    'lh_oneshot_crash_high_short_grit.wav',
    'lh_oneshot_crash_low_old_lost.wav',
  ],
}

export function getDrumSamplePath(category: string, index: number): string {
  const samples = DRUM_SAMPLES[category]
  if (!samples || samples.length === 0) return ''
  const file = samples[index % samples.length]!
  const subdir = category.startsWith('hats_') ? 'hats' : category
  return `${BASE}/drums/${subdir}/${file}`
}

export const MUSIC_KITS: MusicKit[] = [
  {
    name: 'birb', mood: 'happy', bpm: 80, key: 'C',
    layers: {
      full: 'lh_music_kit1_birb_full_loop_80_C.wav',
      keys: 'lh_music_kit1_birb_keys_piano_loop_80_C.wav',
      bass: 'lh_music_kit1_birb_bass_synth_loop_80_C.wav',
    },
  },
  {
    name: 'fall', mood: 'melancholy', bpm: 80, key: 'C',
    layers: {
      full: 'lh_music_kit2_fall_full_loop_80_C.wav',
      keys: 'lh_music_kit2_fall_keys_organ_loop_80_C.wav',
      bass: 'lh_music_kit2_fall_bass_electric_loop_80_C.wav',
    },
  },
  {
    name: 'happy', mood: 'upbeat', bpm: 80, key: 'F',
    layers: {
      full: 'lh_music_kit3_happy_full_loop_80_F.wav',
      keys: 'lh_music_kit3_happy_keys_piano_loop_80_F.wav',
      bass: 'lh_music_kit3_happy_bass_acoustic_loop_80_F.wav',
    },
  },
  {
    name: 'rain', mood: 'chill', bpm: 80, key: 'F',
    layers: {
      full: 'lh_music_kit5_rain_full_loop_80_F.wav',
      bass: 'lh_music_kit5_rain_bass_synth_1_loop_80_F.wav',
      keys: 'lh_music_kit5_rain_keys_organ_loop_80_F.wav',
    },
  },
  {
    name: 'sleep', mood: 'dreamy', bpm: 80, key: 'D',
    layers: {
      full: 'lh_music_kit6_sleep_full_loop_80_D.wav',
      keys: 'lh_music_kit6_sleep_guitar_acoustic_loop_80_D.wav',
      bass: 'lh_music_kit6_sleep_bass_electric_loop_80_D.wav',
    },
  },
  {
    name: 'walk', mood: 'peaceful', bpm: 80, key: 'C',
    layers: {
      full: 'lh_music_kit9_walk_full_loop_80_C.wav',
      keys: 'lh_music_kit9_walk_keys_organ_loop_80_C.wav',
      bass: 'lh_music_kit9_walk_bass_electric_loop_80_C.wav',
    },
  },
  {
    name: 'aus', mood: 'warm', bpm: 85, key: 'C',
    layers: {
      full: 'lh_music_kit10_aus_full_loop_85_C.wav',
      ambience: 'lh_music_kit10_aus_ambience_loop_85_C.wav',
      keys: 'lh_music_kit10_aus_keys_organ_loop_85_C.wav',
      bass: 'lh_music_kit10_aus_bass_acoustic_loop_85_C.wav',
    },
  },
  {
    name: 'cold', mood: 'dark', bpm: 85, key: 'E',
    layers: {
      full: 'lh_music_kit12_cold_full_loop_85_E.wav',
      keys: 'lh_music_kit12_cold_keys_organ_loop_85_E.wav',
      bass: 'lh_music_kit12_cold_bass_electric_loop_85_E.wav',
    },
  },
  {
    name: 'leaf', mood: 'gentle', bpm: 85, key: 'D',
    layers: {
      full: 'lh_music_kit16_leaf_full_loop_85_D.wav',
      keys: 'lh_music_kit16_leaf_guitar_electric_loop_85_D.wav',
    },
  },
  {
    name: 'nap', mood: 'sleepy', bpm: 85, key: 'C',
    layers: {
      full: 'lh_music_kit19_nap_full_loop_85_C.wav',
      keys: 'lh_music_kit19_nap_keys_organ_loop_85_C.wav',
      bass: 'lh_music_kit19_nap_bass_synth_loop_85_C.wav',
    },
  },
  {
    name: 'pap', mood: 'groovy', bpm: 80, key: 'C',
    layers: {
      full: 'lh_music_kit4_pap_full_loop_80_C.wav',
      keys: 'lh_music_kit4_pap_keys_organ_loop_80_C.wav',
      bass: 'lh_music_kit4_pap_bass_electric_loop_80_C.wav',
    },
  },
  {
    name: 'tell', mood: 'nostalgic', bpm: 80, key: 'A',
    layers: {
      full: 'lh_music_kit7_tell_full_loop_80_A.wav',
      keys: 'lh_music_kit7_tell_guitar_electric_loop_80_A.wav',
      bass: 'lh_music_kit7_tell_bass_electric_loop_80_A.wav',
    },
  },
  {
    name: 'tulip', mood: 'emotional', bpm: 80, key: 'D',
    layers: {
      full: 'lh_music_kit8_tulip_full_loop_80_D.wav',
      keys: 'lh_music_kit8_tulip_guitar_electric_loop_80_D.wav',
      bass: 'lh_music_kit8_tulip_bass_electric_loop_80_D.wav',
    },
  },
  {
    name: 'burr', mood: 'moody', bpm: 85, key: 'B',
    layers: {
      full: 'lh_music_kit11_burr_full_loop_85_B.wav',
      keys: 'lh_music_kit11_burr_guitar_electric_loop_85_B.wav',
      bass: 'lh_music_kit11_burr_bass_electric_loop_85_B.wav',
    },
  },
  {
    name: 'despa', mood: 'longing', bpm: 85, key: 'D',
    layers: {
      full: 'lh_music_kit13_despa_full_loop_85_D.wav',
      keys: 'lh_music_kit13_despa_keys_piano_loop_85_D.wav',
      bass: 'lh_music_kit13_despa_bass_electric_loop_85_D.wav',
    },
  },
  {
    name: 'frog', mood: 'hazy', bpm: 85, key: 'D',
    layers: {
      full: 'lh_music_kit14_frog_full_loop_85_D.wav',
      keys: 'lh_music_kit14_frog_keys_organ_loop_85_D.wav',
      bass: 'lh_music_kit14_frog_sub_loop_85_D.wav',
    },
  },
  {
    name: 'haze', mood: 'foggy', bpm: 85, key: 'C',
    layers: {
      full: 'lh_music_kit15_haze_full_loop_85_C.wav',
      keys: 'lh_music_kit15_haze_keys_organ_loop_85_C.wav',
      bass: 'lh_music_kit15_haze_bass_electric_loop_85_C.wav',
    },
  },
  {
    name: 'lily', mood: 'ethereal', bpm: 85, key: 'C',
    layers: {
      full: 'lh_music_kit17_lily_full_loop_85_C.wav',
      keys: 'lh_music_kit17_lily_harp_loop_85_C.wav',
      bass: 'lh_music_kit17_lily_bass_electric_loop_85_C.wav',
    },
  },
  {
    name: 'misch', mood: 'mellow', bpm: 85, key: 'C',
    layers: {
      full: 'lh_music_kit18_misch_full_loop_85_C.wav',
      keys: 'lh_music_kit18_misch_keys_organ_loop_85_C.wav',
      bass: 'lh_music_kit18_misch_bass_electric_loop_85_C.wav',
    },
  },
]

export const VINYL_LOOPS = [
  { path: `${BASE}/loops/vinyl/lh_vinyl_crackle_loop_soft_80.wav`, bpm: 80 },
  { path: `${BASE}/loops/vinyl/lh_vinyl_crackle_loop_cracks_80.wav`, bpm: 80 },
  { path: `${BASE}/loops/vinyl/lh_vinyl_crackle_loop_warm_85.wav`, bpm: 85 },
  { path: `${BASE}/loops/vinyl/lh_vinyl_crackle_loop_vibe_85.wav`, bpm: 85 },
  { path: `${BASE}/loops/vinyl/lh_vinyl_crackle_loop_kriz_85.wav`, bpm: 85 },
]

export const BASS_LOOPS = [
  { path: `${BASE}/loops/bass/lh_bass_loop_fall_80_C.wav`, bpm: 80, key: 'C' },
  { path: `${BASE}/loops/bass/lh_bass_loop_tub_80_C.wav`, bpm: 80, key: 'C' },
  { path: `${BASE}/loops/bass/lh_bass_loop_rain_80_F.wav`, bpm: 80, key: 'F' },
  { path: `${BASE}/loops/bass/lh_bass_loop_sleep_80_D.wav`, bpm: 80, key: 'D' },
  { path: `${BASE}/loops/bass/lh_bass_loop_dial_80_G.wav`, bpm: 80, key: 'G' },
  { path: `${BASE}/loops/bass/lh_bass_loop_drog_80_G.wav`, bpm: 80, key: 'G' },
  { path: `${BASE}/loops/bass/lh_bass_loop_rep_80_G.wav`, bpm: 80, key: 'G' },
  { path: `${BASE}/loops/bass/lh_bass_loop_sedu_80_G.wav`, bpm: 80, key: 'G' },
  { path: `${BASE}/loops/bass/lh_bass_loop_emot_80_B.wav`, bpm: 80, key: 'B' },
  { path: `${BASE}/loops/bass/lh_bass_loop_pic_80_B.wav`, bpm: 80, key: 'B' },
  { path: `${BASE}/loops/bass/lh_bass_loop_thic_80_B.wav`, bpm: 80, key: 'B' },
  { path: `${BASE}/loops/bass/lh_bass_loop_lab_80_Gm.wav`, bpm: 80, key: 'Gm' },
  { path: `${BASE}/loops/bass/lh_bass_loop_rat_80_Gm.wav`, bpm: 80, key: 'Gm' },
  { path: `${BASE}/loops/bass/lh_bass_loop_aus_85_C.wav`, bpm: 85, key: 'C' },
  { path: `${BASE}/loops/bass/lh_bass_loop_nap_85_C.wav`, bpm: 85, key: 'C' },
  { path: `${BASE}/loops/bass/lh_bass_loop_nap2_85_C.wav`, bpm: 85, key: 'C' },
  { path: `${BASE}/loops/bass/lh_bass_loop_thic_85_C.wav`, bpm: 85, key: 'C' },
  { path: `${BASE}/loops/bass/lh_bass_loop_cold_85_E.wav`, bpm: 85, key: 'E' },
  { path: `${BASE}/loops/bass/lh_bass_loop_leaf_85_D.wav`, bpm: 85, key: 'D' },
]

export function getMusicLoopPath(filename: string): string {
  return `${BASE}/loops/music/${filename}`
}

export function pickKitByMood(mood: string): MusicKit {
  const match = MUSIC_KITS.find(k => k.mood === mood)
  return match ?? MUSIC_KITS[0]!
}

export function pickRandomKit(): MusicKit {
  return MUSIC_KITS[Math.floor(Math.random() * MUSIC_KITS.length)]!
}

// Language family → drum sample presets
export interface LanguageDrumPreset {
  kicks: string[]
  snares: string[]
  hats_closed: string[]
  hats_open: string[]
  claps: string[]
  percussion: string[]
  moods: string[]
}

export const LANGUAGE_PRESETS: Record<string, LanguageDrumPreset> = {
  systems: {
    kicks: ['lh_oneshot_kick_low_tight_mac.wav', 'lh_oneshot_kick_low_tight_info.wav', 'lh_oneshot_kick_low_short_kan.wav'],
    snares: ['lh_oneshot_snare_mid_click_knok.wav', 'lh_oneshot_snare_mid_short_beau.wav', 'lh_oneshot_snare_low_punch_dirt.wav'],
    hats_closed: ['lh_oneshot_hat_closed_high_tight_laz.wav', 'lh_oneshot_hat_closed_high_tight_regz.wav'],
    hats_open: ['lh_oneshot_hat_open_high_short_degra.wav', 'lh_oneshot_hat_open_high_sharp_line.wav'],
    claps: ['lh_oneshot_clap_mid_click_nok.wav'],
    percussion: ['lh_oneshot_percussion_high_click_tick.wav', 'lh_oneshot_percussion_mid_shake_reva.wav'],
    moods: ['cold', 'melancholy', 'moody', 'foggy'],
  },
  web: {
    kicks: ['lh_oneshot_kick_low_punch_amore.wav', 'lh_oneshot_kick_low_punch_round.wav', 'lh_oneshot_kick_low_short_kan.wav'],
    snares: ['lh_oneshot_snare_mid_snap_quik.wav', 'lh_oneshot_snare_mid_click_knok.wav', 'lh_oneshot_snare_high_snap_plastic.wav'],
    hats_closed: ['lh_oneshot_hat_closed_high_bright_bb.wav', 'lh_oneshot_hat_closed_high_bright_ghst.wav', 'lh_oneshot_hat_closed_high_synth_lil.wav'],
    hats_open: ['lh_oneshot_hat_open_high_bright_rmmbr.wav', 'lh_oneshot_hat_open_high_bright_warm.wav'],
    claps: ['lh_oneshot_clap_mid_short_pop.wav'],
    percussion: ['lh_oneshot_percussion_mid_click_micro.wav', 'lh_oneshot_percussion_mid_shake_reva.wav'],
    moods: ['happy', 'upbeat', 'groovy', 'nostalgic'],
  },
  scripting: {
    kicks: ['lh_oneshot_kick_low_deep_donk.wav', 'lh_oneshot_kick_low_deep_thicc.wav', 'lh_oneshot_kick_low_warm_dump.wav'],
    snares: ['lh_oneshot_snare_low_lofi_trash.wav', 'lh_oneshot_snare_low_body_steak.wav', 'lh_oneshot_snare_low_wet_wush.wav'],
    hats_closed: ['lh_oneshot_hat_closed_mid_soft_alli.wav', 'lh_oneshot_hat_closed_high_wide_kit.wav'],
    hats_open: ['lh_oneshot_hat_open_high_soft_sha.wav', 'lh_oneshot_hat_open_high_soft_vine.wav'],
    claps: ['lh_oneshot_clap_mid_short_rim.wav'],
    percussion: ['lh_oneshot_percussion_mid_shake_reva.wav', 'lh_oneshot_percussion_low_click_tok.wav'],
    moods: ['chill', 'dreamy', 'hazy', 'emotional'],
  },
  data: {
    kicks: ['lh_oneshot_kick_low_soft_cymb.wav', 'lh_oneshot_kick_low_soft_shui.wav', 'lh_oneshot_kick_low_loose_biggin.wav'],
    snares: ['lh_oneshot_snare_low_hollow_luz.wav', 'lh_oneshot_snare_low_wet_wush.wav', 'lh_oneshot_snare_low_boxy_stone.wav'],
    hats_closed: ['lh_oneshot_hat_closed_low_snap_clak.wav', 'lh_oneshot_hat_closed_low_tight_ex.wav'],
    hats_open: ['lh_oneshot_hat_open_high_noise_messy.wav', 'lh_oneshot_hat_open_high_wide_swus.wav'],
    claps: ['lh_oneshot_clap_low_click_dubz.wav'],
    percussion: ['lh_oneshot_percussion_low_click_crik.wav', 'lh_oneshot_percussion_mid_shake_reva.wav'],
    moods: ['sleepy', 'gentle', 'ethereal', 'mellow'],
  },
  mobile: {
    kicks: ['lh_oneshot_kick_low_tight_info.wav', 'lh_oneshot_kick_low_tight_mekk.wav', 'lh_oneshot_kick_low_punch_criz.wav'],
    snares: ['lh_oneshot_snare_mid_short_beau.wav', 'lh_oneshot_snare_mid_snap_tap.wav', 'lh_oneshot_snare_mid_snap_ew.wav'],
    hats_closed: ['lh_oneshot_hat_closed_high_click_crick.wav', 'lh_oneshot_hat_closed_high_click_tny.wav'],
    hats_open: ['lh_oneshot_hat_open_high_short_degra.wav', 'lh_oneshot_hat_open_mid_soft_play.wav'],
    claps: ['lh_oneshot_clap_mid_short_pop.wav'],
    percussion: ['lh_oneshot_percussion_mid_click_micro.wav', 'lh_oneshot_percussion_high_click_tick.wav'],
    moods: ['peaceful', 'warm', 'longing'],
  },
  mixed: {
    kicks: ['lh_oneshot_kick_low_deep_donk.wav', 'lh_oneshot_kick_low_punch_round.wav'],
    snares: ['lh_oneshot_snare_low_lofi_trash.wav', 'lh_oneshot_snare_mid_snap_quik.wav'],
    hats_closed: ['lh_oneshot_hat_closed_high_bright_bb.wav', 'lh_oneshot_hat_closed_high_tight_laz.wav'],
    hats_open: ['lh_oneshot_hat_open_high_bright_dream.wav'],
    claps: ['lh_oneshot_clap_mid_short_pop.wav'],
    percussion: ['lh_oneshot_percussion_mid_click_micro.wav', 'lh_oneshot_percussion_mid_shake_reva.wav'],
    moods: ['chill', 'peaceful', 'groovy', 'mellow'],
  },
}

export function getPresetSamplePath(category: string, files: string[]): string {
  const file = files[Math.floor(Math.random() * files.length)]!
  const subdir = category.startsWith('hats_') ? 'hats' : category
  return `${BASE}/drums/${subdir}/${file}`
}

export function pickKitByLanguageMoods(moods: string[]): MusicKit {
  const matches = MUSIC_KITS.filter(k => moods.includes(k.mood))
  if (matches.length === 0) return pickRandomKit()
  return matches[Math.floor(Math.random() * matches.length)]!
}

// Ambient layers
export const AMBIENT_LAYERS = [
  { id: 'rain', name: 'Rain', path: `${BASE}/loops/foley/lh_foley_loop_rain_80.wav`, bpm: 80 },
  { id: 'drips', name: 'Drips', path: `${BASE}/loops/foley/lh_foley_loop_drips_80.wav`, bpm: 80 },
  { id: 'umbrella', name: 'Umbrella', path: `${BASE}/loops/foley/lh_foley_loop_umbrella_80.wav`, bpm: 80 },
  { id: 'keys', name: 'Keys', path: `${BASE}/loops/foley/lh_foley_loop_keys_80.wav`, bpm: 80 },
  { id: 'carpet', name: 'Carpet', path: `${BASE}/loops/foley/lh_foley_loop_carpet_80.wav`, bpm: 80 },
  { id: 'sheets', name: 'Sheets', path: `${BASE}/loops/foley/lh_foley_loop_sheets_80.wav`, bpm: 80 },
  { id: 'tap', name: 'Tap', path: `${BASE}/loops/foley/lh_foley_loop_tap_80.wav`, bpm: 80 },
  { id: 'dark', name: 'Dark', path: `${BASE}/loops/foley/lh_foley_loop_dark_85.wav`, bpm: 85 },
  { id: 'vinyl_soft', name: 'Vinyl (soft)', path: `${BASE}/loops/vinyl/lh_vinyl_crackle_loop_soft_80.wav`, bpm: 80 },
  { id: 'vinyl_warm', name: 'Vinyl (warm)', path: `${BASE}/loops/vinyl/lh_vinyl_crackle_loop_warm_85.wav`, bpm: 85 },
]
