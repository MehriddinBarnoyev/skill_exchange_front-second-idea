"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Send, MoreVertical, Phone, Video, ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { sendMessage, getMessages } from "@/lib/messages"
import { format } from "date-fns"
import { getFriends } from "@/lib/connections"

const API_URL = "http://localhost:5000"
const POLLING_INTERVAL = 5000 // 5 seconds

interface Connection {
  id: string
  connected_user_id: string
  connected_user_name: string
  connected_user_profession: string
  connected_user_profile_pic: string
}

interface Friend {
  id: string
  connectionId: string
  name: string
  profession: string
  profile_pic: string
  last_message?: string
  last_message_time?: string
  unread_count?: number
  last_active?: string
}

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  sender_name: string
  sender_profile_pic: string
  receiver_id: string
  receiver_name: string
  receiver_profile_pic: string
}

export default function ChatPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showFriendsList, setShowFriendsList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize user data
  useEffect(() => {
    const token = localStorage.getItem("token")
    const currentUserId = localStorage.getItem("userId")

    if (!token || !currentUserId) {
      router.push("/login")
      return
    }

    setUserId(currentUserId)

    // Check for mobile view
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [router])

  // Fetch friends list
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token || !userId) return

        const connections = await getFriends(userId)

        // Transform to Friend interface
        const formattedFriends = connections.map((connection: Connection) => ({
          id: connection.connected_user_id,
          connectionId: connection.id,
          name: connection.connected_user_name,
          profession: connection.connected_user_profession,
          profile_pic: connection.connected_user_profile_pic,
          last_active: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Random last active time
        }))

        setFriends(formattedFriends)

        // Check if there's a userId in the URL params to auto-select a chat
        const chatWithUserId = searchParams.get("userId")
        if (chatWithUserId) {
          const friendToSelect = formattedFriends.find((friend) => friend.id === chatWithUserId)
          if (friendToSelect) {
            setSelectedFriend(friendToSelect)
            // On mobile, hide the friends list
            if (window.innerWidth < 768) {
              setShowFriendsList(false)
            }
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch connections:", error)
        toast({
          title: "Error",
          description: "Failed to load your contacts. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchConnections()
    }
  }, [userId, searchParams])

  // Fetch messages when a friend is selected and start polling
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedFriend || !userId) return

      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const fetchedMessages = await getMessages( userId, selectedFriend.id)
        setMessages(fetchedMessages)
      } catch (error) {
        console.error("Failed to fetch messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchMessages()

    // Setup polling for new messages
    if (selectedFriend && userId) {
      // Clear any existing polling
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }

      // Start new polling
      pollingRef.current = setInterval(fetchMessages, POLLING_INTERVAL)
    }

    // Mobile view: hide friends list when a friend is selected
    if (isMobileView && selectedFriend) {
      setShowFriendsList(false)
    }

    // Cleanup polling when component unmounts or friend changes
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [selectedFriend, userId, isMobileView])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend || !userId) return

    setIsSending(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const message = await sendMessage(
        {
          sender_id: userId,
          reciever_id: selectedFriend.id,
          message: newMessage,
        },
        userId
      )

      // Optimistically add message to UI
      const optimisticMessage: Message = {
        id: Date.now().toString(), // Temporary ID
        content: newMessage,
        created_at: new Date().toISOString(),
        sender_id: userId,
        sender_name: "You", // Will be replaced when refreshed
        sender_profile_pic: "",
        receiver_id: selectedFriend.id,
        receiver_name: selectedFriend.name,
        receiver_profile_pic: selectedFriend.profile_pic,
      }

      setMessages((prev) => [...prev, optimisticMessage])
      setNewMessage("")

      // Immediately fetch messages to get the actual message with server ID
      const updatedMessages = await getMessages( userId, selectedFriend.id)
      console.log(updatedMessages);
      
      setMessages(updatedMessages)
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(friend)
  }

  const handleBackToFriendsList = () => {
    setShowFriendsList(true)
  }

  const isUserActive = (lastActive: string | undefined) => {
    if (!lastActive) return false

    // Consider active if last active within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return new Date(lastActive) > fiveMinutesAgo
  }

  const getLastActiveText = (lastActive: string | undefined) => {
    if (!lastActive) return "Offline"

    if (isUserActive(lastActive)) {
      return "Online"
    }

    const lastActiveDate = new Date(lastActive)
    const now = new Date()

    // If today, show time
    if (lastActiveDate.toDateString() === now.toDateString()) {
      return `Last seen today at ${format(lastActiveDate, "h:mm a")}`
    }

    // If yesterday
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (lastActiveDate.toDateString() === yesterday.toDateString()) {
      return `Last seen yesterday at ${format(lastActiveDate, "h:mm a")}`
    }

    // Otherwise show date
    return `Last seen on ${format(lastActiveDate, "MMM d")}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <Card className="h-full flex flex-col md:flex-row overflow-hidden">
        {/* Friends List - Hidden on mobile when chat is open */}
        {(showFriendsList || !isMobileView) && (
          <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">Messages</h2>
              <Input placeholder="Search contacts..." className="mt-2" />
            </div>

            <div className="divide-y divide-gray-100">
              {friends.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No contacts found. Add friends to start chatting!</div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className={`p-3 flex items-center hover:bg-gray-50 cursor-pointer ${
                      selectedFriend?.id === friend.id ? "bg-gray-100" : ""
                    }`}
                    onClick={() => handleSelectFriend(friend)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`${API_URL}${friend.profile_pic}`} alt={friend.name} />
                        <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {isUserActive(friend.last_active) && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{friend.name}</h3>
                        {friend.last_message_time && (
                          <span className="text-xs text-gray-500">{friend.last_message_time}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 truncate max-w-[150px]">
                          {friend.profession || "No profession"}
                        </p>
                        {friend.unread_count && friend.unread_count > 0 && (
                          <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {friend.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat Area */}
        {selectedFriend ? (
          <div className="flex-1 flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                {isMobileView && !showFriendsList && (
                  <Button variant="ghost" size="icon" onClick={handleBackToFriendsList} className="mr-2">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`${API_URL}${selectedFriend.profile_pic}`} alt={selectedFriend.name} />
                  <AvatarFallback>{selectedFriend.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <h3 className="font-medium">{selectedFriend.name}</h3>
                  <div className="flex items-center">
                    <p className="text-xs text-gray-500">{selectedFriend.profession}</p>
                    <span className="mx-2 text-xs text-gray-300">•</span>
                    <p className="text-xs text-gray-500">{getLastActiveText(selectedFriend.last_active)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <p>No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender_id === userId

                  return (
                    <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                      {!isOwnMessage && (
                        <Avatar className="h-8 w-8 mr-2 mt-1">
                          <AvatarImage src={`${API_URL}${message.sender_profile_pic}`} alt={message.sender_name} />
                          <AvatarFallback>{message.sender_name.charAt(0)}</AvatarFallback>
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
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1"
                  disabled={isSending}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSending}>
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700">Select a contact</h3>
              <p className="text-gray-500">Choose a friend to start chatting</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

