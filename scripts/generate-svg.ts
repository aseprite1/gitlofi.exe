import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface ContributionDay {
  date: string
  weekday: number
  level: number
  count: number
}

interface ContributionWeek {
  days: ContributionDay[]
}

interface SequencerPattern {
  rows: number
  cols: number
  grid: number[][]
}

async function fetchContributionsGraphQL(username: string, token: string) {
  const query = `query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              contributionLevel
              date
              weekday
            }
          }
        }
      }
    }
  }`

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables: { username } }),
  })

  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const json = await res.json()

  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? 'GraphQL error')
  }

  const calendar = json.data.user.contributionsCollection.contributionCalendar
  const levelMap: Record<string, number> = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  }

  const weeks: ContributionWeek[] = calendar.weeks.map((w: { contributionDays: Array<{ date: string; weekday: number; contributionLevel: string; contributionCount: number }> }) => ({
    days: w.contributionDays.map((d) => ({
      date: d.date,
      weekday: d.weekday,
      level: levelMap[d.contributionLevel] ?? 0,
      count: d.contributionCount,
    })),
  }))

  return { username, totalContributions: calendar.totalContributions, weeks }
}

async function fetchContributionsPublic(username: string) {
  const res = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`
  )
  if (!res.ok) throw new Error(`Failed to fetch contributions: ${res.status}`)
  const data = await res.json()
  const dates = Object.keys(data.contributions).sort()

  const weeks: ContributionWeek[] = []
  let currentWeek: ContributionDay[] = []

  for (const date of dates) {
    const entry = data.contributions[date]
    const d = new Date(date + 'T00:00:00')
    const weekday = d.getUTCDay()

    currentWeek.push({ date, weekday, level: entry.level, count: entry.count })

    if (weekday === 6 || date === dates[dates.length - 1]) {
      weeks.push({ days: [...currentWeek] })
      currentWeek = []
    }
  }

  return { username, totalContributions: data.total?.lastYear ?? 0, weeks }
}

function contributionsToPattern(data: { weeks: ContributionWeek[] }): SequencerPattern {
  const cols = data.weeks.length
  const rows = 7
  const grid: number[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0)
  )
  for (let c = 0; c < cols; c++) {
    const week = data.weeks[c]!
    for (const day of week.days) {
      grid[day.weekday]![c] = day.level / 4
    }
  }
  return { rows, cols, grid }
}

// SVG generation (duplicated from src/lib to avoid bundling issues)
const CELL_SIZE = 14
const GAP = 3
const PADDING = 16
const LABEL_WIDTH = 60
const COLORS = ['rgba(255,255,255,0.04)', '#0e4429', '#006d32', '#26a641', '#39d353']
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const INSTRUMENT_LABELS = ['Kick', 'Snare', 'HH-C', 'HH-O', 'Tom-L', 'Tom-M', 'Clap']

function generateSVG(pattern: SequencerPattern, username: string): string {
  const duration = 8
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
        vel > 0 ? ` class="hit" style="animation-delay:${delay}s"` : ''
      }/>\n`
    }
  }

  let labels = ''
  for (let row = 0; row < rows; row++) {
    const y = PADDING + row * (CELL_SIZE + GAP) + CELL_SIZE / 2
    labels += `<text x="${PADDING + LABEL_WIDTH - 8}" y="${y}" fill="#7d8590" font-size="10" font-family="monospace" text-anchor="end" dominant-baseline="central">${INSTRUMENT_LABELS[row]} ${DAY_LABELS[row]}</text>\n`
  }

  const playheadEndX = gridWidth - CELL_SIZE

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
<style>
  @keyframes sweep { 0% { transform: translateX(0); } 100% { transform: translateX(${playheadEndX}px); } }
  @keyframes blink { 0%, 15%, 100% { opacity: 1; transform: scale(1); } 7.5% { opacity: 1; transform: scale(1.2); } }
  .hit { animation: blink ${duration}s linear infinite; }
  .playhead { animation: sweep ${duration}s linear infinite; }
</style>
<rect width="${totalWidth}" height="${totalHeight}" rx="6" fill="#0d1117"/>
${labels}
${cells}
<g class="playhead">
  <rect x="${PADDING + LABEL_WIDTH}" y="${PADDING}" width="${CELL_SIZE}" height="${gridHeight}" rx="2" fill="rgba(88,166,255,0.2)"/>
</g>
<text x="${PADDING}" y="${totalHeight - 8}" fill="#7d8590" font-size="10" font-family="monospace">@${username} — gitdrum</text>
</svg>`
}

async function main() {
  const username = process.argv[2]
  if (!username) {
    console.error('Usage: tsx generate-svg.ts <username>')
    process.exit(1)
  }

  console.log(`Fetching contributions for @${username}...`)

  const token = process.env['GITHUB_TOKEN']
  const data = token
    ? await fetchContributionsGraphQL(username, token)
    : await fetchContributionsPublic(username)

  console.log(`Total contributions: ${data.totalContributions}`)

  const pattern = contributionsToPattern(data)
  const svg = generateSVG(pattern, username)

  const outDir = join(__dirname, '..', 'output')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, 'drum-pattern.svg')
  writeFileSync(outPath, svg, 'utf-8')

  console.log(`SVG written to ${outPath}`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
