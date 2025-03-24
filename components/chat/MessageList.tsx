"use client"

/**
 * MessageList component
 * Displays the list of messages in a conversation
 * Handles scrolling, read receipts, and typing indicators
 */
import { useRef, useEffect, useState, useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ChevronDown, Circle } from "lucide-react"
import { TypingIndicator } from "./TypingIndicator"
import type { Message } from "@/lib/messages"

interface MessageListProps {
  messages: Message[]
  userId: string | null
  apiUrl: string
  onMessagesRead?: () => Promise<void>
  isTyping?: boolean
}

export function MessageList({ messages, userId, apiUrl, onMessagesRead, isTyping = false }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [prevMessagesLength, setPrevMessagesLength] = useState(0)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Memoize sorted messages to prevent unnecessary re-renders
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }, [messages])

  // Check if there are any unread messages from the other user
  useEffect(() => {
    if (!userId) return

    const unreadMessages = sortedMessages.some((msg) => msg.sender_id !== userId && msg.isread === false)

    setHasUnreadMessages(unreadMessages)

    // If component is visible and there are unread messages, mark them as read
    if (isVisible && unreadMessages && onMessagesRead) {
      onMessagesRead()
    }
  }, [sortedMessages, userId, onMessagesRead, isVisible])

  // Set up visibility detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }, // 10% visibility is enough to consider it "visible"
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  // Mark messages as read when component becomes visible
  useEffect(() => {
    if (isVisible && hasUnreadMessages && onMessagesRead) {
      onMessagesRead()
    }
  }, [isVisible, hasUnreadMessages, onMessagesRead])

  // Check if user is near bottom of the chat
  const checkIfNearBottom = () => {
    if (!containerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const scrollPosition = scrollTop + clientHeight
    const isAtBottom = scrollHeight - scrollPosition < 100 // Within 100px of bottom

    setIsNearBottom(isAtBottom)
    setShowScrollButton(!isAtBottom && messages.length > 0)
  }

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      checkIfNearBottom()
    }

    container.addEventListener("scroll", handleScroll)
    return () => {
      container.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Scroll to bottom when new messages arrive if user was already at bottom
  useEffect(() => {
    // Only auto-scroll if:
    // 1. User is near the bottom already OR
    // 2. User just sent a message (messages length increased by 1 and last message is from user)
    const userJustSentMessage =
      messages.length > prevMessagesLength &&
      messages.length === prevMessagesLength + 1 &&
      messages[messages.length - 1]?.sender_id === userId

    if (isNearBottom || userJustSentMessage) {
      scrollToBottom("smooth")
    }

    setPrevMessagesLength(messages.length)
  }, [messages.length, isNearBottom, prevMessagesLength, userId, messages])

  // Scroll to bottom when typing indicator appears
  useEffect(() => {
    if (isTyping && isNearBottom) {
      scrollToBottom("smooth")
    }
  }, [isTyping, isNearBottom])

  // Initial scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("auto")
      setIsNearBottom(true)
    }
  }, [])

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="h-full flex flex-col items-center justify-center text-gray-500">
          <p>No messages yet</p>
          <p className="text-sm">Send a message to start the conversation</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 relative" ref={containerRef}>
      {sortedMessages.map((message) => {
        const isOwnMessage = message.sender_id === userId
        const isUnread = !isOwnMessage && message.isread === false

        return (
          <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
            {!isOwnMessage && (
              <Avatar className="h-8 w-8 mr-2 mt-1">
                <AvatarImage
                  src={
                    message.sender_profile_pic
                      ? message.sender_profile_pic.startsWith("http")
                        ? message.sender_profile_pic
                        : `${apiUrl}${message.sender_profile_pic}`
                      : undefined
                  }
                  alt={message.sender_name}
                />
                <AvatarFallback>{message.sender_name?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
            )}
            <div className="max-w-[70%]">
              <div
                className={`rounded-lg p-3 ${
                  isOwnMessage
                    ? "bg-primary text-white rounded-tr-none"
                    : isUnread
                      ? "bg-blue-50 border border-blue-200 rounded-tl-none"
                      : "bg-white border border-gray-200 rounded-tl-none"
                }`}
              >
                {message.content}
              </div>
              <div
                className={`flex items-center text-xs text-gray-500 mt-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                {format(new Date(message.created_at), "h:mm a")}
                {isUnread && <Circle className="h-2 w-2 ml-1 fill-blue-500 text-blue-500" />}
              </div>
            </div>
          </div>
        )
      })}

      {/* Typing indicator */}
      {isTyping && <TypingIndicator />}

      <div ref={messagesEndRef} />

      {showScrollButton && (
        <Button
          className="absolute bottom-4 right-4 rounded-full w-10 h-10 p-0 shadow-md"
          onClick={() => scrollToBottom()}
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}

