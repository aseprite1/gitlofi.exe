import type { ContributionData, SequencerPattern } from '../types'

export function contributionsToPattern(data: ContributionData): SequencerPattern {
  const cols = data.weeks.length
  const rows = 7
  const grid: number[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0)
  )

  for (let c = 0; c < cols; c++) {
    const week = data.weeks[c]
    if (!week) continue
    for (const day of week.days) {
      const row = grid[day.weekday]
      if (row) {
        row[c] = day.level / 4
      }
    }
  }

  return { rows, cols, grid }
}
