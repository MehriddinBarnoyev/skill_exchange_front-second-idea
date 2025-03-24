"use client"

/**
 * Custom hook for real-time communication
 * Uses a combination of SSE (Server-Sent Events) for receiving messages
 * and standard fetch API for sending messages
 */
import { useEffect, useState, useCallback, useRef } from "react"
import { toast } from "@/components/ui/use-toast"

interface UseWebSocketOptions {
  onMessageReceived?: (data: any) => void
  onMessageStatus?: (data: any) => void
  onUserStatus?: (data: any) => void
  onUserTyping?: (data: any) => void
  onUsersOnline?: (data: string[]) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  // Store options in a ref to avoid dependency changes
  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const connect = useCallback(() => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setError("Authentication token not found")
        return
      }

      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }

      // Connect to SSE endpoint
      const url = new URL(`${apiBaseUrl}/events`)
      url.searchParams.append("token", token)

      const eventSource = new EventSource(url.toString())
      eventSourceRef.current = eventSource

      // Connection events
      eventSource.onopen = () => {
        setIsConnected(true)
        setError(null)
      }

      eventSource.onerror = () => {
        setIsConnected(false)
        setError("Connection error")

        // Only show toast if we're still using this event source
        if (eventSourceRef.current === eventSource) {
          toast({
            title: "Connection Error",
            description: "Failed to connect to notification server",
            variant: "destructive",
          })

          // Auto-reconnect after a delay
          setTimeout(() => {
            if (eventSourceRef.current === eventSource) {
              // Close the current connection before reconnecting
              eventSource.close()
              eventSourceRef.current = null
              connect()
            }
          }, 5000)
        }
      }

      // Message events
      eventSource.addEventListener("message:received", (event) => {
        try {
          const data = JSON.parse(event.data)
          optionsRef.current.onMessageReceived?.(data)
        } catch (e) {
          console.error("Failed to parse message data", e)
        }
      })

      eventSource.addEventListener("message:status", (event) => {
        try {
          const data = JSON.parse(event.data)
          optionsRef.current.onMessageStatus?.(data)
        } catch (e) {
          console.error("Failed to parse message status data", e)
        }
      })

      // User events
      eventSource.addEventListener("user:status", (event) => {
        try {
          const data = JSON.parse(event.data)
          optionsRef.current.onUserStatus?.(data)
        } catch (e) {
          console.error("Failed to parse user status data", e)
        }
      })

      eventSource.addEventListener("user:typing", (event) => {
        try {
          const data = JSON.parse(event.data)
          optionsRef.current.onUserTyping?.(data)
        } catch (e) {
          console.error("Failed to parse user typing data", e)
        }
      })

      eventSource.addEventListener("users:online", (event) => {
        try {
          const data = JSON.parse(event.data)
          optionsRef.current.onUsersOnline?.(data)
        } catch (e) {
          console.error("Failed to parse users online data", e)
        }
      })
    } catch (err) {
      setError("Failed to initialize connection")
      console.error("Connection initialization error:", err)
    }
  }, [apiBaseUrl])

  const disconnect = useCallback(() => {
    // Store the current state in a local variable to avoid state updates
    const currentEventSource = eventSourceRef.current

    if (currentEventSource) {
      currentEventSource.close()
      eventSourceRef.current = null

      // Use a timeout to avoid immediate state updates that could cause loops
      setTimeout(() => {
        setIsConnected(false)
      }, 0)
    }
  }, [])

  // Send a new message using fetch API
  const sendMessage = useCallback(
    async (receiverId: string, message: any) => {
      const token = localStorage.getItem("token")
      if (!token) {
        return
      }

      try {
        const response = await fetch(`${apiBaseUrl}/messages/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ receiverId, message }),
        })

        if (!response.ok) {
          throw new Error("Failed to send message")
        }
      } catch (err) {
        console.error("Error sending message:", err)
        throw err
      }
    },
    [apiBaseUrl],
  )

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    async (senderId: string, messageIds: string[]) => {
      const token = localStorage.getItem("token")
      if (!token) {
        return
      }

      try {
        const response = await fetch(`${apiBaseUrl}/messages/read`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ senderId, messageIds }),
        })

        if (!response.ok) {
          throw new Error("Failed to mark messages as read")
        }
      } catch (err) {
        console.error("Error marking messages as read:", err)
        throw err
      }
    },
    [apiBaseUrl],
  )

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    async (receiverId: string, isTyping: boolean) => {
      const token = localStorage.getItem("token")
      if (!token) {
        return
      }

      try {
        const response = await fetch(`${apiBaseUrl}/messages/typing`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ receiverId, isTyping }),
        })

        if (!response.ok) {
          throw new Error("Failed to send typing indicator")
        }
      } catch (err) {
        console.error("Error sending typing indicator:", err)
        // Don't throw for typing indicators as they're not critical
      }
    },
    [apiBaseUrl],
  )

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    // Only connect once on mount
    connect()

    // Cleanup on unmount
    return () => {
      const currentEventSource = eventSourceRef.current
      if (currentEventSource) {
        currentEventSource.close()
        eventSourceRef.current = null
      }
    }
  }, [connect])

  return {
    isConnected,
    error,
    sendMessage,
    markMessagesAsRead,
    sendTypingIndicator,
    connect,
    disconnect,
  }
}

