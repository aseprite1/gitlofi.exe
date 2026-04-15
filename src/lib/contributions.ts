import type { ContributionData, ContributionWeek, ContributionDay } from '../types'

interface ApiContribution {
  date: string;
  count: number;
  level: number;
}

interface ApiResponse {
  total: Record<string, number>;
  contributions: ApiContribution[];
}

export async function fetchContributions(
  username: string,
  year: string = 'last'
): Promise<ContributionData> {
  const res = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=${year}`
  )

  if (!res.ok) {
    if (res.status === 404) throw new Error(`User "${username}" not found`)
    throw new Error(`Failed to fetch contributions (${res.status})`)
  }

  const data: ApiResponse = await res.json()

  if (data.contributions.length === 0) {
    throw new Error(`No contribution data found for "${username}"`)
  }

  const weeks: ContributionWeek[] = []
  let currentWeek: ContributionDay[] = []

  for (const entry of data.contributions) {
    const d = new Date(entry.date + 'T00:00:00')
    const weekday = d.getUTCDay()

    currentWeek.push({
      date: entry.date,
      weekday,
      level: entry.level,
      count: entry.count,
    })

    if (weekday === 6 || entry === data.contributions[data.contributions.length - 1]) {
      weeks.push({ days: [...currentWeek] })
      currentWeek = []
    }
  }

  const totalKey = year === 'last' ? 'lastYear' : year
  return {
    username,
    totalContributions: data.total[totalKey] ?? 0,
    weeks,
  }
}
