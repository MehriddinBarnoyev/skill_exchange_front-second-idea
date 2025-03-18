"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2, UserPlus, MessageSquare, UserMinus } from "lucide-react"
import { deleteFriend, getFriends, sendConnectionRequest } from "@/lib/connections"
import { ChatModal } from "./ChatModal"
import { ConfirmDialog } from "./ConfirmDialog"

interface ConnectionRequestButtonProps {
  receiverId: string
  receiverName: string
  receiverAvatar?: string
  className?: string
}

export function ConnectionRequestButton({
  receiverId,
  receiverName,
  receiverAvatar,
  className,
}: ConnectionRequestButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFriend, setIsFriend] = useState(false)
  const [isCheckingFriendship, setIsCheckingFriendship] = useState(true)
  const [showChatModal, setShowChatModal] = useState(false)
  const [showConfirmRemove, setShowConfirmRemove] = useState(false)

  useEffect(() => {
    const checkIfFriend = async () => {
      try {
        setIsCheckingFriendship(true)
        const token = localStorage.getItem("token")
        const userId = localStorage.getItem("userId")

        if (!token || !userId) {
          return
        }

        const friends = await getFriends(userId,)
        
        const isFriend = friends.some((friend: { connected_user_id: string }) => friend.connected_user_id === receiverId)
        setIsFriend(isFriend)
      } catch (error) {
        console.error("Error checking friendship status:", error)
      } finally {
        setIsCheckingFriendship(false)
      }
    }

    checkIfFriend()
  }, [receiverId])

  const handleSendRequest = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const userId = localStorage.getItem("userId")

      if (!token || !userId) {
        toast({
          title: "Authentication Error",
          description: "Please log in to send connection requests",
          variant: "destructive",
        })
        return
      }

      await sendConnectionRequest(token, userId, receiverId)

      toast({
        title: "Request Sent",
        description: "Connection request has been sent successfully",
      })
    } catch (error) {
      console.error("Error sending connection request:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send connection request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFriend = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const userId = localStorage.getItem("userId")

      if (!token || !userId) {
        toast({
          title: "Authentication Error",
          description: "Please log in to remove friends",
          variant: "destructive",
        })
        return
      }

      await deleteFriend(userId, receiverId)
      setIsFriend(false)

      toast({
        title: "Friend Removed",
        description: "Successfully removed from your friends list",
      })
    } catch (error) {
      console.error("Error removing friend:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove friend",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowConfirmRemove(false)
    }
  }

  if (isCheckingFriendship) {
    return (
      <Button disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Checking...
      </Button>
    )
  }

  if (isFriend) {
    return (
      <div className="flex space-x-2">
        <Button onClick={() => setShowChatModal(true)} className={`${className} bg-green-600 hover:bg-green-700`}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat
        </Button>
        <Button onClick={() => setShowConfirmRemove(true)} variant="destructive" className={className}>
          <UserMinus className="h-4 w-4 mr-2" />
          Remove
        </Button>

        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          friendId={receiverId}
          friendName={receiverName}
          friendAvatar={receiverAvatar}
        />

        <ConfirmDialog
          isOpen={showConfirmRemove}
          onClose={() => setShowConfirmRemove(false)}
          onConfirm={handleRemoveFriend}
          title="Remove Friend"
          description={`Are you sure you want to remove ${receiverName} from your friends list?`}
          confirmText="Remove"
          cancelText="Cancel"
        />
      </div>
    )
  }

  return (
    <Button onClick={handleSendRequest} disabled={isLoading} className={className}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
      Connect
    </Button>
  )
}

