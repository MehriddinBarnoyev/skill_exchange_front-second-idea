"use client"

import type React from "react"

/**
 * Custom hook for managing chat state
 * Centralizes state management for the chat application
 */
import { useState, useRef } from "react"
import type { Friend } from "@/components/chat/FriendsList"
import type { Message } from "@/lib/messages"

export interface ChatState {
  // UI state
  friends: Friend[]
  selectedFriend: Friend | null
  messages: Message[]
  isLoading: boolean
  isMobileView: boolean
  showFriendsList: boolean

  // WebSocket related state
  onlineUsers: string[]
  typingUsers: Record<string, boolean>

  // User info
  userId: string | null

  // References
  lastMessagesRef: React.MutableRefObject<string>
  typingTimeoutRef: React.MutableRefObject<Record<string, NodeJS.Timeout>>
  pollingRef: React.MutableRefObject<NodeJS.Timeout | null>
}

export interface ChatStateActions {
  setFriends: (friends: Friend[] | ((prev: Friend[]) => Friend[])) => void
  setSelectedFriend: (friend: Friend | null) => void
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void
  setIsLoading: (isLoading: boolean) => void
  setIsMobileView: (isMobileView: boolean) => void
  setShowFriendsList: (showFriendsList: boolean) => void
  setOnlineUsers: (users: string[] | ((prev: string[]) => string[])) => void
  setTypingUsers: (
    users: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>),
  ) => void
  setUserId: (userId: string | null) => void
  resetChatState: () => void
}

export function useChatState(): [ChatState, ChatStateActions] {
  // UI state
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showFriendsList, setShowFriendsList] = useState(true)

  // WebSocket related state
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({})

  // User info
  const [userId, setUserId] = useState<string | null>(null)

  // References
  const lastMessagesRef = useRef<string>("")
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({})
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const resetChatState = () => {
    setFriends([])
    setSelectedFriend(null)
    setMessages([])
    setIsLoading(true)
    setShowFriendsList(true)
    setOnlineUsers([])
    setTypingUsers({})
    lastMessagesRef.current = ""

    // Clear any active timeouts
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }

    Object.values(typingTimeoutRef.current).forEach((timeout) => {
      clearTimeout(timeout)
    })
    typingTimeoutRef.current = {}
  }

  const state: ChatState = {
    friends,
    selectedFriend,
    messages,
    isLoading,
    isMobileView,
    showFriendsList,
    onlineUsers,
    typingUsers,
    userId,
    lastMessagesRef,
    typingTimeoutRef,
    pollingRef,
  }

  const actions: ChatStateActions = {
    setFriends,
    setSelectedFriend,
    setMessages,
    setIsLoading,
    setIsMobileView,
    setShowFriendsList,
    setOnlineUsers,
    setTypingUsers,
    setUserId,
    resetChatState,
  }

  return [state, actions]
}

