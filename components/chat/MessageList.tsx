"use client"

import { useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import type { Message } from "@/lib/messages"

interface MessageListProps {
  messages: Message[]
  userId: string | null
  apiUrl: string
}

export function MessageList({ messages, userId, apiUrl }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.map((message) => {
        const isOwnMessage = message.sender_id === userId

        return (
          <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
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
      <div ref={messagesEndRef} />
    </div>
  )
}

