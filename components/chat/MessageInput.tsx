"use client"

/**
 * MessageInput component
 * Handles user input for sending messages
 * Includes typing indicator functionality
 */
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Send } from "lucide-react"

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>
  onInputChange?: (value: string) => void
}

export function MessageInput({ onSendMessage, onInputChange }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = async () => {
    if (!message.trim()) return

    setIsSending(true)
    try {
      await onSendMessage(message)
      setMessage("")
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessage(value)

    // Debounce typing indicator
    if (onInputChange) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      onInputChange(value)

      // Stop typing indicator after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (value.length > 0) {
          onInputChange("")
        }
      }, 1000)
    }
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="p-3 border-t border-gray-200">
      <div className="flex items-center space-x-2">
        <Input
          ref={inputRef}
          placeholder="Type a message..."
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          className="flex-1"
          disabled={isSending}
        />
        <Button onClick={handleSend} disabled={!message.trim() || isSending}>
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

