"use client"

/**
 * Custom hook for chat actions
 * Handles all business logic for the chat functionality
 */
import { useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { getFriends } from "@/lib/connection"
import { sendMessage, getMessages, markMessagesAsRead } from "@/lib/messages"
import type { Friend } from "@/components/chat/FriendsList"
import type { Message } from "@/lib/messages"
import type { ChatState, ChatStateActions } from "./useChatState"

interface UseChatActionsProps {
  state: ChatState
  actions: ChatStateActions
  isWebSocketConnected: boolean
  wsSendMessage: (receiverId: string, message: any) => void
  wsMarkMessagesAsRead: (senderId: string, messageIds: string[]) => void
  sendTypingIndicator: (receiverId: string, isTyping: boolean) => void
}

export function useChatActions({
  state,
  actions,
  isWebSocketConnected,
  wsSendMessage,
  wsMarkMessagesAsRead,
  sendTypingIndicator,
}: UseChatActionsProps) {
  const router = useRouter()

  // Use refs to avoid dependency changes in callbacks
  const stateRef = useRef(state)
  const actionsRef = useRef(actions)
  const isConnectedRef = useRef(isWebSocketConnected)

  // Update refs when props change - move to useEffect
  useEffect(() => {
    stateRef.current = state
    actionsRef.current = actions
    isConnectedRef.current = isWebSocketConnected
  }, [state, actions, isWebSocketConnected])

  /**
   * Fetches the user's friends/connections
   */
  const fetchFriends = useCallback(async (userId: string, chatWithUserId?: string | null) => {
    const currentActions = actionsRef.current

    try {
      const connections = await getFriends(userId)

      // Transform to Friend interface and add unread counts
      const formattedFriends = connections.map((connection) => {
        return {
          id: connection.connected_user_id,
          connectionId: connection.id,
          name: connection.connected_user_name,
          profession: connection.connected_user_profession,
          profile_pic: connection.connected_user_profile_pic,
          last_active: connection.last_active || new Date(Date.now() - Math.random() * 3600000).toISOString(),
          created_at: connection.created_at || new Date().toISOString(),
          unread_count: connection.unread_count || 0,
          last_message: connection.last_message || "",
          last_message_time: connection.last_message_time || "",
        }
      })

      currentActions.setFriends(formattedFriends)

      // Check if there's a userId in the URL params to auto-select a chat
      if (chatWithUserId) {
        const friendToSelect = formattedFriends.find((friend) => friend.id === chatWithUserId)
        if (friendToSelect) {
          currentActions.setSelectedFriend(friendToSelect)
          // On mobile, hide the friends list
          if (window.innerWidth < 768) {
            currentActions.setShowFriendsList(false)
          }
        }
      }

      currentActions.setIsLoading(false)
    } catch (error) {
      console.error("Failed to fetch connections:", error)
      toast({
        title: "Error",
        description: "Failed to load your contacts. Please try again.",
        variant: "destructive",
      })
      currentActions.setIsLoading(false)
    }
  }, [])

  /**
   * Fetches messages between the current user and the selected friend
   */
  const fetchMessages = useCallback(async () => {
    const currentState = stateRef.current
    const currentActions = actionsRef.current
    const { selectedFriend, userId, lastMessagesRef } = currentState

    if (!selectedFriend || !userId) return

    try {
      const fetchedMessages = await getMessages(userId, selectedFriend.id)

      // Process messages to add names and profile pics if needed
      if (fetchedMessages.length > 0) {
        fetchedMessages.forEach((message) => {
          if (message.sender_id === userId && !message.sender_name) {
            message.sender_name = "You"
            message.sender_profile_pic = ""
          } else if (message.sender_id === selectedFriend.id && !message.sender_name) {
            message.sender_name = selectedFriend.name
            message.sender_profile_pic = selectedFriend.profile_pic
          }
        })
      }

      // Compare with previous messages to avoid unnecessary re-renders
      const messagesJson = JSON.stringify(fetchedMessages)
      if (messagesJson !== lastMessagesRef.current) {
        lastMessagesRef.current = messagesJson
        currentActions.setMessages(fetchedMessages)

        // Update unread count for the selected friend
        const unreadCount = fetchedMessages.filter(
          (msg) => msg.sender_id === selectedFriend.id && msg.isread === false,
        ).length

        // Update the friends list with new unread count
        currentActions.setFriends((prev) =>
          prev.map((friend) => (friend.id === selectedFriend.id ? { ...friend, unread_count: unreadCount } : friend)),
        )

        // If there are unread messages, mark them as read
        if (unreadCount > 0) {
          handleMessagesRead()
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
      // Only show toast on first error, not during polling
      if (currentState.messages.length === 0) {
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        })
      }
    }
  }, [])

  /**
   * Marks messages from the selected friend as read
   */
  const handleMessagesRead = useCallback(async () => {
    const currentState = stateRef.current
    const currentActions = actionsRef.current
    const isConnected = isConnectedRef.current
    const { selectedFriend, messages } = currentState

    if (!selectedFriend) return

    try {
      // Mark all messages from this sender as read
      await markMessagesAsRead(selectedFriend.id)

      // Also notify via WebSocket for real-time updates
      if (isConnected) {
        const unreadMessageIds = messages
          .filter((msg) => msg.sender_id === selectedFriend.id && !msg.isread)
          .map((msg) => msg.id)

        if (unreadMessageIds.length > 0) {
          wsMarkMessagesAsRead(selectedFriend.id, unreadMessageIds)
        }
      }

      // Update local message state to mark these as read
      currentActions.setMessages((prev) =>
        prev.map((msg) => (msg.sender_id === selectedFriend.id && !msg.isread ? { ...msg, isread: true } : msg)),
      )

      // Update unread count for the selected friend
      currentActions.setFriends((prev) =>
        prev.map((friend) => (friend.id === selectedFriend.id ? { ...friend, unread_count: 0 } : friend)),
      )
    } catch (error) {
      console.error("Failed to mark messages as read:", error)
    }
  }, [wsMarkMessagesAsRead])

  /**
   * Sends a message to the selected friend
   */
  const handleSendMessage = useCallback(
    async (message: string) => {
      const currentState = stateRef.current
      const currentActions = actionsRef.current
      const isConnected = isConnectedRef.current
      const { selectedFriend, userId } = currentState

      if (!message.trim() || !selectedFriend || !userId) return

      try {
        // Create message object
        const newMessage: Message = {
          id: `temp-${Date.now()}`, // Temporary ID
          content: message,
          created_at: new Date().toISOString(),
          isread: false,
          sender_id: userId,
          sender_name: "You", // Will be replaced when refreshed
          sender_profile_pic: "",
          receiver_id: selectedFriend.id,
          receiver_name: selectedFriend.name,
          receiver_profile_pic: selectedFriend.profile_pic,
        }

        // Update UI immediately with optimistic message
        currentActions.setMessages((prev) => [...prev, newMessage])

        // Send message via WebSocket if connected
        if (isConnected) {
          wsSendMessage(selectedFriend.id, newMessage)
        }

        // Also send via REST API (for persistence)
        const sentMessage = await sendMessage({
          sender_id: userId,
          reciever_id: selectedFriend.id,
          message: message,
        })

        // Update the last message for this friend in the friends list
        currentActions.setFriends((prev) =>
          prev.map((friend) =>
            friend.id === selectedFriend.id
              ? {
                  ...friend,
                  last_message: message,
                  last_message_time: format(new Date(), "h:mm a"),
                }
              : friend,
          ),
        )

        // Clear typing indicator
        if (isConnected) {
          sendTypingIndicator(selectedFriend.id, false)
        }

        // If not using WebSockets, fetch updated messages from server
        if (!isConnected) {
          await fetchMessages()
        } else {
          // Replace the temporary message with the real one
          currentActions.setMessages((prev) =>
            prev.map((msg) => (msg.id === newMessage.id ? { ...sentMessage, sender_name: "You" } : msg)),
          )
        }
      } catch (error) {
        console.error("Failed to send message:", error)

        // Remove the optimistic message on error
        currentActions.setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")))

        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })
        throw error // Re-throw to let the MessageInput component handle it
      }
    },
    [wsSendMessage, sendTypingIndicator, fetchMessages],
  )

  /**
   * Handles selecting a friend from the friends list
   */
  const handleSelectFriend = useCallback(
    (friend: Friend) => {
      const currentActions = actionsRef.current

      currentActions.setSelectedFriend(friend)

      // When selecting a friend, mark their messages as read
      if (friend.unread_count && friend.unread_count > 0) {
        // Small delay to ensure the chat is loaded first
        setTimeout(() => {
          handleMessagesRead()
        }, 500)
      }
    },
    [handleMessagesRead],
  )

  /**
   * Handles input changes for typing indicator
   */
  const handleInputChange = useCallback(
    (value: string) => {
      const currentState = stateRef.current
      const isConnected = isConnectedRef.current
      const { selectedFriend } = currentState

      if (selectedFriend && isConnected) {
        sendTypingIndicator(selectedFriend.id, value.length > 0)
      }
    },
    [sendTypingIndicator],
  )

  /**
   * Initializes the chat by loading the user ID from localStorage
   */
  const initializeChat = useCallback(() => {
    const currentActions = actionsRef.current

    const token = localStorage.getItem("token")
    const currentUserId = localStorage.getItem("userId")

    if (!token || !currentUserId) {
      router.push("/login")
      return false
    }

    currentActions.setUserId(currentUserId)
    return true
  }, [router])

  return {
    fetchFriends,
    fetchMessages,
    handleMessagesRead,
    handleSendMessage,
    handleSelectFriend,
    handleInputChange,
    initializeChat,
  }
}

