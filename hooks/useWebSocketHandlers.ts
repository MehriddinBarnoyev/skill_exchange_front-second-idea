"use client"

/**
 * Custom hook for WebSocket event handlers
 * Centralizes WebSocket event handling logic
 */
import { useCallback, useRef, useEffect } from "react"
import { format } from "date-fns"
import type { ChatState, ChatStateActions } from "./useChatState"

export function useWebSocketHandlers(state: ChatState, actions: ChatStateActions) {
  // Use refs to avoid dependency changes in callbacks
  const stateRef = useRef(state)
  const actionsRef = useRef(actions)

  // Update refs when props change - move this to useEffect
  useEffect(() => {
    stateRef.current = state
    actionsRef.current = actions
  }, [state, actions])

  /**
   * Handles incoming messages from WebSocket
   */
  const handleMessageReceived = useCallback((data: any) => {
    const currentState = stateRef.current
    const currentActions = actionsRef.current
    const { selectedFriend } = currentState
    const { senderId, message } = data

    // Add the new message to the messages list if it's from the currently selected friend
    if (selectedFriend && senderId === selectedFriend.id) {
      currentActions.setMessages((prev) => [...prev, message])

      // Mark the message as read immediately if we're in the chat
      handleMessagesRead()
    } else {
      // Update unread count for the friend
      currentActions.setFriends((prev) =>
        prev.map((friend) =>
          friend.id === senderId
            ? {
                ...friend,
                unread_count: (friend.unread_count || 0) + 1,
                last_message: message.content,
                last_message_time: format(new Date(message.created_at), "h:mm a"),
              }
            : friend,
        ),
      )
    }
  }, [])

  /**
   * Handles message status updates from WebSocket
   */
  const handleMessageStatus = useCallback((data: any) => {
    const currentActions = actionsRef.current
    const { messageIds, status } = data

    if (status === "read") {
      // Update message read status
      currentActions.setMessages((prev) =>
        prev.map((msg) => (messageIds.includes(msg.id) ? { ...msg, isread: true } : msg)),
      )
    }
  }, [])

  /**
   * Handles user status updates from WebSocket
   */
  const handleUserStatus = useCallback((data: any) => {
    const currentActions = actionsRef.current
    const { userId, status, lastSeen } = data

    // Update friend's online status
    currentActions.setFriends((prev) =>
      prev.map((friend) =>
        friend.id === userId
          ? { ...friend, last_active: status === "online" ? new Date().toISOString() : lastSeen }
          : friend,
      ),
    )

    // Update online users list
    if (status === "online") {
      currentActions.setOnlineUsers((prev) => {
        if (prev.includes(userId)) return prev
        return [...prev, userId]
      })
    } else {
      currentActions.setOnlineUsers((prev) => prev.filter((id) => id !== userId))
    }
  }, [])

  /**
   * Handles typing indicator updates from WebSocket
   */
  const handleUserTyping = useCallback((data: any) => {
    const currentState = stateRef.current
    const currentActions = actionsRef.current
    const { userId, isTyping } = data
    const { typingTimeoutRef } = currentState

    currentActions.setTypingUsers((prev) => ({ ...prev, [userId]: isTyping }))

    // Clear typing indicator after 3 seconds of inactivity
    if (isTyping && typingTimeoutRef.current[userId]) {
      clearTimeout(typingTimeoutRef.current[userId])
    }

    if (isTyping) {
      typingTimeoutRef.current[userId] = setTimeout(() => {
        currentActions.setTypingUsers((prev) => ({ ...prev, [userId]: false }))
      }, 3000)
    }
  }, [])

  /**
   * Handles online users list updates from WebSocket
   */
  const handleUsersOnline = useCallback((data: string[]) => {
    const currentActions = actionsRef.current
    currentActions.setOnlineUsers(data)
  }, [])

  /**
   * Marks messages as read
   * This is a placeholder that will be replaced with the actual implementation
   */
  const handleMessagesRead = useCallback(() => {
    // This is just a stub - the actual implementation is in useChatActions
    // We need this here to avoid circular dependencies
  }, [])

  return {
    handleMessageReceived,
    handleMessageStatus,
    handleUserStatus,
    handleUserTyping,
    handleUsersOnline,
    handleMessagesRead,
  }
}

