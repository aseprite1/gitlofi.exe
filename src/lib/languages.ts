export interface LanguageEntry {
  name: string
  count: number
  percent: number
  color: string
  family: LanguageFamily
}

export interface LanguageProfile {
  entries: LanguageEntry[]
  topLanguage: string
  dominantFamily: LanguageFamily
  totalRepos: number
}

export type LanguageFamily = 'systems' | 'web' | 'scripting' | 'data' | 'mobile' | 'mixed'

const FAMILY_MAP: Record<string, LanguageFamily> = {
  Rust: 'systems',
  C: 'systems',
  'C++': 'systems',
  Go: 'systems',
  Zig: 'systems',
  Assembly: 'systems',
  JavaScript: 'web',
  TypeScript: 'web',
  HTML: 'web',
  CSS: 'web',
  Vue: 'web',
  Svelte: 'web',
  Python: 'scripting',
  Ruby: 'scripting',
  PHP: 'scripting',
  Perl: 'scripting',
  Lua: 'scripting',
  Shell: 'scripting',
  'Jupyter Notebook': 'data',
  R: 'data',
  Julia: 'data',
  MATLAB: 'data',
  Scala: 'data',
  Swift: 'mobile',
  Kotlin: 'mobile',
  Dart: 'mobile',
  Java: 'mobile',
  'Objective-C': 'mobile',
}

export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Lua: '#000080',
  R: '#198CE7',
  Julia: '#a270ba',
  Scala: '#c22d40',
  Perl: '#0298c3',
  Zig: '#ec915c',
  Assembly: '#6E4C13',
  MATLAB: '#e16737',
  'Objective-C': '#438eff',
  'Jupyter Notebook': '#DA5B0B',
  Haskell: '#5e5086',
  Elixir: '#6e4a7e',
  Clojure: '#db5855',
  Erlang: '#B83998',
  Vim: '#199f4b',
  Nix: '#7e7eff',
  HCL: '#844FBA',
  Dockerfile: '#384d54',
  Makefile: '#427819',
}

interface RepoResponse {
  language: string | null
  fork: boolean
}

export async function fetchLanguageProfile(username: string): Promise<LanguageProfile> {
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`
  )

  if (!res.ok) {
    return { entries: [], topLanguage: 'Unknown', dominantFamily: 'mixed', totalRepos: 0 }
  }

  const repos: RepoResponse[] = await res.json()
  const langCounts: Record<string, number> = {}
  let totalWithLang = 0

  for (const repo of repos) {
    if (repo.language && !repo.fork) {
      langCounts[repo.language] = (langCounts[repo.language] ?? 0) + 1
      totalWithLang++
    }
  }

  const sorted = Object.entries(langCounts).sort((a, b) => b[1] - a[1])
  const topLanguage = sorted[0]?.[0] ?? 'Unknown'

  const entries: LanguageEntry[] = sorted.map(([name, count]) => ({
    name,
    count,
    percent: totalWithLang > 0 ? (count / totalWithLang) * 100 : 0,
    color: LANGUAGE_COLORS[name] ?? '#8b949e',
    family: FAMILY_MAP[name] ?? 'mixed',
  }))

  const familyCounts: Record<LanguageFamily, number> = {
    systems: 0, web: 0, scripting: 0, data: 0, mobile: 0, mixed: 0,
  }

  for (const entry of entries) {
    familyCounts[entry.family] += entry.count
  }

  const dominantFamily = (Object.entries(familyCounts) as [LanguageFamily, number][])
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'mixed'

  return { entries, topLanguage, dominantFamily, totalRepos: repos.length }
}
