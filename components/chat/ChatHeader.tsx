"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreVertical, Phone, Video, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import type { Friend } from "@/types/chat"

interface ChatHeaderProps {
  friend: Friend
  isMobileView: boolean
  showFriendsList: boolean
  onBackToFriendsList: () => void
}

export function ChatHeader({ friend, isMobileView, showFriendsList, onBackToFriendsList }: ChatHeaderProps) {
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

  return (
    <div className="p-3 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center">
        {isMobileView && !showFriendsList && (
          <Button variant="ghost" size="icon" onClick={onBackToFriendsList} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={friend.profile_pic} alt={friend.name} />
          <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h3 className="font-medium">{friend.name}</h3>
          <div className="flex items-center">
            <p className="text-xs text-gray-500">{friend.profession}</p>
            <span className="mx-2 text-xs text-gray-300">•</span>
            <p className="text-xs text-gray-500">{getLastActiveText(friend.last_active)}</p>
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
  )
}

