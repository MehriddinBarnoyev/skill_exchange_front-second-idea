"use client"

/**
 * Chat Page
 * Main page component for the chat application
 */
import { useEffect, useCallback, useRef, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { API_URL } from "@/lib/messages"
import { useWebSocket } from "@/hooks/useWebSocket"
import { useChatState } from "@/hooks/useChatState"
import { useChatActions } from "@/hooks/useChatActions"
import { useWebSocketHandlers } from "@/hooks/useWebSocketHandlers"
import { useFallbackPolling } from "@/hooks/useFallbackPolling"
import { ChatContainer } from "@/components/chat/ChatContainer"

// Add environment variable for API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function ChatPage() {
  const searchParams = useSearchParams()
  const initRef = useRef(false)
  const chatWithUserIdRef = useRef(searchParams.get("userId"))

  // Initialize chat state
  const [state, actions] = useChatState()

  // Set up WebSocket handlers
  const wsHandlers = useWebSocketHandlers(state, actions)

  // Memoize WebSocket options to prevent unnecessary re-renders
  const wsOptions = useMemo(
    () => ({
      onMessageReceived: wsHandlers.handleMessageReceived,
      onMessageStatus: wsHandlers.handleMessageStatus,
      onUserStatus: wsHandlers.handleUserStatus,
      onUserTyping: wsHandlers.handleUserTyping,
      onUsersOnline: wsHandlers.handleUsersOnline,
    }),
    [wsHandlers],
  )

  // Initialize WebSocket connection
  const {
    isConnected: isWebSocketConnected,
    error: wsError,
    sendMessage: wsSendMessage,
    markMessagesAsRead: wsMarkMessagesAsRead,
    sendTypingIndicator,
  } = useWebSocket(wsOptions)

  // Memoize chat actions props
  const chatActionsProps = useMemo(
    () => ({
      state,
      actions,
      isWebSocketConnected,
      wsSendMessage,
      wsMarkMessagesAsRead,
      sendTypingIndicator,
    }),
    [state, actions, isWebSocketConnected, wsSendMessage, wsMarkMessagesAsRead, sendTypingIndicator],
  )

  // Set up chat actions
  const {
    fetchFriends,
    fetchMessages,
    handleMessagesRead,
    handleSendMessage,
    handleSelectFriend,
    handleInputChange,
    initializeChat,
  } = useChatActions(chatActionsProps)

  // Assign the actual implementation of handleMessagesRead to the WebSocket handlers
  useEffect(() => {
    wsHandlers.handleMessagesRead = handleMessagesRead
  }, [wsHandlers, handleMessagesRead])

  // Initialize user data and handle window resize
  useEffect(() => {
    // Prevent multiple initializations
    if (initRef.current) return
    initRef.current = true

    const initialized = initializeChat()
    if (!initialized) return

    // Check for mobile view
    const handleResize = () => {
      actions.setIsMobileView(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      actions.resetChatState()
    }
  }, [initializeChat, actions])

  // Fetch friends list when userId is available
  useEffect(() => {
    if (state.userId) {
      fetchFriends(state.userId, chatWithUserIdRef.current)
    }
  }, [state.userId, fetchFriends])

  // Fetch messages when a friend is selected
  useEffect(() => {
    if (!state.selectedFriend) return

    // Reset messages when changing friends
    actions.setMessages([])
    state.lastMessagesRef.current = ""

    // Initial fetch
    fetchMessages()

    // Mobile view: hide friends list when a friend is selected
    if (state.isMobileView && state.selectedFriend) {
      actions.setShowFriendsList(false)
    }
  }, [state.selectedFriend, state.isMobileView, actions, fetchMessages])

  // Show WebSocket connection error
  useEffect(() => {
    if (wsError) {
      console.warn("Connection error:", wsError)
      // Only show toast for non-authentication errors to avoid spamming the user
      if (!wsError.includes("Authentication")) {
        toast({
          title: "Connection Issue",
          description: "Using fallback mode for messages. Some real-time features may be limited.",
          variant: "default",
        })
      }
    }
  }, [wsError])

  // Handle back to friends list button click
  const handleBackToFriendsList = useCallback(() => {
    actions.setShowFriendsList(true)
  }, [actions])

  // Set up fallback polling when WebSocket is not connected
  const fallbackPollingProps = useMemo(
    () => ({
      isEnabled: !isWebSocketConnected && !!state.selectedFriend && !!state.userId,
      interval: 5000,
      onPoll: fetchMessages,
    }),
    [isWebSocketConnected, state.selectedFriend, state.userId, fetchMessages],
  )

  useFallbackPolling(fallbackPollingProps)

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <ChatContainer
      friends={state.friends}
      selectedFriend={state.selectedFriend}
      messages={state.messages}
      userId={state.userId}
      apiUrl={API_URL}
      isMobileView={state.isMobileView}
      showFriendsList={state.showFriendsList}
      onlineUsers={state.onlineUsers}
      typingUsers={state.typingUsers}
      onSelectFriend={handleSelectFriend}
      onBackToFriendsList={handleBackToFriendsList}
      onSendMessage={handleSendMessage}
      onInputChange={handleInputChange}
      onMessagesRead={handleMessagesRead}
    />
  )
}

