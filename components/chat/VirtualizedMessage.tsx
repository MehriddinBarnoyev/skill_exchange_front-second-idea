"use client"

import { useRef, useEffect, useState, useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useVirtualScroll } from "@/hooks/useVirtualScroll"
import type { ChatMessage } from "@/types/chat"

interface VirtualizedMessageListProps {
  messages: ChatMessage[]
  userId: string | null
  apiUrl: string
  onLoadMoreMessages?: () => Promise<void>
  hasMoreMessages?: boolean
}

export function VirtualizedMessageList({
  messages,
  userId,
  apiUrl,
  onLoadMoreMessages,
  hasMoreMessages = false,
}: VirtualizedMessageListProps) {
  const MESSAGE_ITEM_HEIGHT = 80 // Approximate height of each message
  const scrollToBottomRef = useRef<HTMLDivElement>(null)
  const [initialScrollDone, setInitialScrollDone] = useState(false)

  // Sort messages chronologically (oldest first)
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }, [messages])

  const { containerRef, visibleItems, topPadding, bottomPadding, isLoadingMore } = useVirtualScroll({
    items: sortedMessages,
    itemHeight: MESSAGE_ITEM_HEIGHT,
    loadMoreItems: onLoadMoreMessages,
    overscan: 10,
    isReverse: true,
  })

  // Scroll to bottom on initial load and when new messages are added
  useEffect(() => {
    if (messages.length > 0 && containerRef.current && !initialScrollDone) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
      setInitialScrollDone(true)
    } else if (messages.length > 0 && containerRef.current && initialScrollDone) {
      // Check if we're already at the bottom before auto-scrolling
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100

      if (isAtBottom) {
        scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [messages.length, initialScrollDone])

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
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      <div style={{ height: topPadding }} />
      {visibleItems.map((message) => {
        const isOwnMessage = message.sender_id === userId

        return (
          <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
            {!isOwnMessage && (
              <Avatar className="h-8 w-8 mr-2 mt-1">
                <AvatarImage src={`${apiUrl}${message.sender_profile_pic}`} alt={message.sender_name} />
                <AvatarFallback>{message.sender_name?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
            )}
            <div className="max-w-[70%]">
              <div
                className={`rounded-lg p-3 ${
                  isOwnMessage
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-white border border-gray-200 rounded-tl-none"
                }`}
              >
                {message.content}
              </div>
              <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? "text-right" : "text-left"}`}>
                {format(new Date(message.created_at), "h:mm a")}
              </div>
            </div>
          </div>
        )
      })}
      <div style={{ height: bottomPadding }} />
      <div ref={scrollToBottomRef} />
    </div>
  )
}

