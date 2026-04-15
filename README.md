# gitlofi.exe

> Turn your GitHub contributions into lo-fi beats

A Win98-themed web app that transforms your GitHub contribution graph into a unique lo-fi hip-hop beat. Each developer's coding pattern creates a different rhythm, and your primary programming languages shape the sound profile.

**[Try it live](https://gitlofi.vercel.app)**

---

## How it works

1. Enter a GitHub username or profile URL
2. Your contribution graph becomes a 7-track drum sequencer (one per day of the week)
3. Programming languages determine your sound profile
4. Background melodies, bass, and vinyl textures layer on top
5. Every developer sounds different

## Features

- **Contribution-to-beat conversion** — 52 weeks of commits become 52 steps of rhythm
- **Language-based sound profiles** — Rust devs sound different from Python devs
- **19 lo-fi melody kits** — Randomized per play, matched to your language family
- **Ambient mixer** — Rain, vinyl crackle, drips, and more (toggle independently)
- **Interactive grid** — Click cells to add/remove beats, reset to original
- **Year selector** — Listen to different years of your coding history
- **Win98 UI** — Draggable windows, taskbar, CRT effects, Clippy
- **VU meter** — Real-time audio level visualization
- **CRT effects** — Scanlines, vignette, noise, dot mask, RGB shift, glow (all toggleable)
- **Share** — Copy link or share on X with auto-generated URL

## Day-to-instrument mapping

| Day | Instrument | Why |
|-----|-----------|-----|
| Sun | Shaker | Weekend = sparse, subtle texture |
| Mon | Closed Hi-hat | Busy day = rhythm driver |
| Tue | Kick | Peak productivity = foundation |
| Wed | Snare | Midweek = backbeat |
| Thu | Open Hi-hat | Variation |
| Fri | Clap | Winding down = accent |
| Sat | Rim | Weekend = minimal point |

## Sound profiles

| Language Family | Vibe | Examples |
|----------------|------|----------|
| Systems | Cold & Crisp | C, Rust, Go |
| Web | Bright & Snappy | JavaScript, TypeScript |
| Scripting | Deep & Warm | Python, Ruby |
| Data | Soft & Dreamy | R, Julia |
| Mobile | Tight & Minimal | Swift, Kotlin |

## Tech stack

- **React** + **TypeScript** + **Vite**
- **Tone.js** — Web Audio synthesis and sample playback
- **98.css** — Windows 98 UI components
- **Vercel** — Hosting

## Local development

```bash
npm install
npm run dev
```

> Note: Audio samples are not included in the repository. Place your own samples in `public/samples/lofi/` following the structure in `src/lib/sampleManifest.ts`.

## License

MIT

---

Built by [@aseprite1](https://github.com/aseprite1)
