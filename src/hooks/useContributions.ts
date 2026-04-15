import { useState, useCallback } from 'react'
import type { ContributionData } from '../types'
import { fetchContributions } from '../lib/contributions'

export function useContributions() {
  const [data, setData] = useState<ContributionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (username: string, year: string = 'last') => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchContributions(username, year)
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch contributions')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, load }
}
