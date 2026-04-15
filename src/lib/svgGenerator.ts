import type { SequencerPattern } from '../types'

const CELL_SIZE = 14
const GAP = 3
const PADDING = 16
const LABEL_WIDTH = 60
const COLORS = ['rgba(255,255,255,0.04)', '#0e4429', '#006d32', '#26a641', '#39d353']
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const INSTRUMENT_LABELS = ['Kick', 'Snare', 'HH-C', 'HH-O', 'Tom-L', 'Tom-M', 'Clap']

export function generateAnimatedSVG(
  pattern: SequencerPattern,
  options: { duration?: number; username?: string } = {}
): string {
  const { duration = 8, username = '' } = options
  const cols = pattern.cols
  const rows = pattern.rows
  const gridWidth = cols * (CELL_SIZE + GAP)
  const gridHeight = rows * (CELL_SIZE + GAP)
  const totalWidth = PADDING * 2 + LABEL_WIDTH + gridWidth
  const totalHeight = PADDING * 2 + gridHeight + 30

  const stepDuration = duration / cols

  let cells = ''
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const vel = pattern.grid[row]?.[col] ?? 0
      const level = Math.round(vel * 4)
      const x = PADDING + LABEL_WIDTH + col * (CELL_SIZE + GAP)
      const y = PADDING + row * (CELL_SIZE + GAP)
      const color = COLORS[level] ?? COLORS[0]!
      const delay = (col * stepDuration).toFixed(3)

      cells += `<rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="2" fill="${color}"${
        vel > 0
          ? ` class="hit" style="animation-delay:${delay}s"`
          : ''
      }/>\n`
    }
  }

  let labels = ''
  for (let row = 0; row < rows; row++) {
    const y = PADDING + row * (CELL_SIZE + GAP) + CELL_SIZE / 2
    labels += `<text x="${PADDING + LABEL_WIDTH - 8}" y="${y}" fill="#7d8590" font-size="10" font-family="monospace" text-anchor="end" dominant-baseline="central">${INSTRUMENT_LABELS[row]} ${DAY_LABELS[row]}</text>\n`
  }

  const playheadHeight = gridHeight
  const playheadEndX = gridWidth - CELL_SIZE

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
<style>
  @keyframes sweep {
    0% { transform: translateX(0); }
    100% { transform: translateX(${playheadEndX}px); }
  }
  @keyframes blink {
    0%, 15%, 100% { opacity: 1; transform: scale(1); }
    7.5% { opacity: 1; transform: scale(1.2); }
  }
  .hit {
    animation: blink ${duration}s linear infinite;
  }
  .playhead {
    animation: sweep ${duration}s linear infinite;
  }
</style>
<rect width="${totalWidth}" height="${totalHeight}" rx="6" fill="#0d1117"/>
${labels}
${cells}
<g class="playhead">
  <rect x="${PADDING + LABEL_WIDTH}" y="${PADDING}" width="${CELL_SIZE}" height="${playheadHeight}" rx="2" fill="rgba(88,166,255,0.2)"/>
</g>
${username ? `<text x="${PADDING}" y="${totalHeight - 8}" fill="#7d8590" font-size="10" font-family="monospace">@${username} — gitdrum</text>` : ''}
</svg>`
}
