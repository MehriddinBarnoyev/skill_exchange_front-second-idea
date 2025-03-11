"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import { connectionApi } from "@/lib/api"
import { messagesApi, type Message } from "@/lib/messagesApi"
import { toast } from "@/components/ui/use-toast"

export default function ChatPage() {
  const { id: friendId } = useParams()
  const [friend, setFriend] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please log in to view this chat",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        // Fetch friend details and messages in parallel
        const [friendData, messagesData] = await Promise.all([
          connectionApi.getUserProfile(friendId as string, token),
          messagesApi.getMessages(friendId as string, token),
        ])

        setFriend(friendData)
        setMessages(messagesData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching chat data:", error)
        toast({
          title: "Error",
          description: "Failed to load chat. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [friendId, router])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsSending(true)
    try {
      const token = localStorage.getItem("token")
      const userId = localStorage.getItem("userId")

      if (!token || !userId) {
        toast({
          title: "Authentication Error",
          description: "Please log in to send messages",
          variant: "destructive",
        })
        return
      }

      const response = await messagesApi.sendMessage(
        {
          sender_id: userId,
          receiver_id: friendId as string,
          message: newMessage.trim(),
        },
        token,
      )

      setMessages([...messages, response])
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar>
            <AvatarImage src={friend?.profilePicture} />
            <AvatarFallback>{friend?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{friend?.name}</h2>
            <p className="text-sm text-gray-500">{friend?.profession || "Online"}</p>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message) => {
            const isCurrentUser = message.sender_id === localStorage.getItem("userId")
            return (
              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">{new Date(message.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex space-x-2 max-w-3xl mx-auto">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={isSending}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  )
}

