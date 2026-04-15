import { useCallback, useRef } from 'react'

export function useClickSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  return useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/samples/lofi/drums/percussion/lh_oneshot_percussion_high_click_tick.wav')
      audioRef.current.volume = 0.3
    }
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
  }, [])
}
