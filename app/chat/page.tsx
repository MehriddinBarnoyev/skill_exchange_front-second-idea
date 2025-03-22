"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { getFriends } from "@/lib/connection"
import { sendMessage, getMessages, API_URL } from "@/lib/messages"
import type { Friend } from "@/components/chat/FriendsList"
import type { Message } from "@/lib/messages"

// Import components
import { FriendsList } from "@/components/chat/FriendsList"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { MessageList } from "@/components/chat/MessageList"
import { MessageInput } from "@/components/chat/MessageInput"
import { EmptyChatState } from "@/components/chat/EmptyChatState"

// Define a polling interval (5 seconds)
const POLLING_INTERVAL = 5000

export default function ChatPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showFriendsList, setShowFriendsList] = useState(true)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessagesRef = useRef<string>("") // Store last messages JSON for comparison
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
        if (!userId) return

        const connections = await getFriends(userId)

        // Transform to Friend interface
        const formattedFriends = connections.map((connection) => ({
          id: connection.connected_user_id,
          connectionId: connection.id,
          name: connection.connected_user_name,
          profession: connection.connected_user_profession,
          profile_pic: connection.connected_user_profile_pic,
          last_active: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Random last active time
          created_at: connection.created_at || new Date().toISOString(), // Use connection creation date if available
        }))

        // Sort friends by creation date (newest first)
        const sortedFriends = [...formattedFriends].sort((a, b) => {
          return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
        })

        setFriends(sortedFriends)

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

  // Create a memoized fetchMessages function that won't change on re-renders
  const fetchMessages = useCallback(async () => {
    if (!selectedFriend || !userId) return

    try {
      const fetchedMessages = await getMessages(userId, selectedFriend.id)

      // Process messages to add names and profile pics
      if (fetchedMessages.length > 0) {
        fetchedMessages.forEach((message) => {
          if (message.sender_id === userId) {
            message.sender_name = "You"
            message.sender_profile_pic = ""
          } else {
            message.sender_name = selectedFriend.name
            message.sender_profile_pic = selectedFriend.profile_pic
          }
        })
      }

      // Compare with previous messages to avoid unnecessary re-renders
      const messagesJson = JSON.stringify(fetchedMessages)
      if (messagesJson !== lastMessagesRef.current) {
        lastMessagesRef.current = messagesJson

        // Sort messages by creation date (oldest first)
        const sortedMessages = [...fetchedMessages].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        )

        setMessages(sortedMessages)
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
      // Only show toast on first error, not during polling
      if (messages.length === 0) {
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        })
      }
    }
  }, [selectedFriend, userId])

  // Fetch messages when a friend is selected and start polling
  useEffect(() => {
    // Reset messages when changing friends
    setMessages([])
    lastMessagesRef.current = ""

    // Initial fetch
    fetchMessages()

    // Setup polling for new messages
    if (selectedFriend && userId) {
      // Clear any existing polling
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }

      // Start new polling with the defined interval
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
  }, [selectedFriend, userId, isMobileView, fetchMessages])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !selectedFriend || !userId) return

    try {
      await sendMessage({
        sender_id: userId,
        reciever_id: selectedFriend.id,
        message,
      })

      // Optimistically add message to UI
      const optimisticMessage: Message = {
        id: Date.now().toString(), // Temporary ID
        content: message,
        created_at: new Date().toISOString(),
        sender_id: userId,
        sender_name: "You", // Will be replaced when refreshed
        sender_profile_pic: "",
        receiver_id: selectedFriend.id,
        receiver_name: selectedFriend.name,
        receiver_profile_pic: selectedFriend.profile_pic,
      }

      // Add new message and sort by creation date
      const updatedMessages = [...messages, optimisticMessage].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )

      setMessages(updatedMessages)
      lastMessagesRef.current = JSON.stringify(updatedMessages)

      // Immediately fetch messages to get the actual message with server ID
      await fetchMessages()
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
      throw error // Re-throw to let the MessageInput component handle it
    }
  }

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(friend)
  }

  const handleBackToFriendsList = () => {
    setShowFriendsList(true)
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
          <FriendsList
            friends={friends}
            selectedFriendId={selectedFriend?.id || null}
            onSelectFriend={handleSelectFriend}
          />
        )}

        {/* Chat Area */}
        {selectedFriend ? (
          <div className="flex-1 flex flex-col h-full">
            <ChatHeader
              friend={selectedFriend}
              isMobileView={isMobileView}
              showFriendsList={showFriendsList}
              onBackToFriendsList={handleBackToFriendsList}
            />
            <MessageList messages={messages} userId={userId} apiUrl={API_URL} />
            <MessageInput onSendMessage={handleSendMessage} />
          </div>
        ) : (
          <EmptyChatState />
        )}
      </Card>
    </div>
  )
}

