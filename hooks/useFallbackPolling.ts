"use client"

/**
 * Custom hook for fallback polling when real-time connection is not available
 * Provides a way to periodically fetch new messages
 */
import { useEffect, useRef, useCallback } from "react"

interface UseFallbackPollingProps {
  isEnabled: boolean
  interval?: number
  onPoll: () => Promise<void>
}

export function useFallbackPolling({ isEnabled, interval = 5000, onPoll }: UseFallbackPollingProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isEnabledRef = useRef(isEnabled)
  const onPollRef = useRef(onPoll)

  // Update refs when props change
  useEffect(() => {
    isEnabledRef.current = isEnabled
    onPollRef.current = onPoll
  }, [isEnabled, onPoll])

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(async () => {
      try {
        await onPollRef.current()
      } catch (error) {
        console.error("Polling error:", error)
      }
    }, interval)
  }, [interval])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isEnabled) {
      startPolling()
    } else {
      stopPolling()
    }

    return () => {
      stopPolling()
    }
  }, [isEnabled, startPolling, stopPolling])

  return {
    isPolling: !!intervalRef.current,
    startPolling,
    stopPolling,
  }
}

