"use client"

/**
 * ChatHeader component
 * Displays information about the current chat and provides navigation controls
 */
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreVertical, Phone, Video, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import type { Friend } from "@/types/chat"
import { API_URL } from "@/lib/messages"

interface ChatHeaderProps {
  friend: Friend
  isMobileView: boolean
  showFriendsList: boolean
  onBackToFriendsList: () => void
  isOnline?: boolean
}

export function ChatHeader({
  friend,
  isMobileView,
  showFriendsList,
  onBackToFriendsList,
  isOnline = false,
}: ChatHeaderProps) {
  const getLastActiveText = (lastActive: string | undefined) => {
    if (isOnline) return "Online"
    if (!lastActive) return "Offline"

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
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                friend.profile_pic
                  ? friend.profile_pic.startsWith("http")
                    ? friend.profile_pic
                    : `${API_URL}${friend.profile_pic}`
                  : undefined
              }
              alt={friend.name}
            />
            <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
          )}
        </div>
        <div className="ml-3">
          <h3 className="font-medium">{friend.name}</h3>
          <div className="flex items-center">
            <p className="text-xs text-gray-500">{friend.profession}</p>
            <span className="mx-2 text-xs text-gray-300">•</span>
            <p className={`text-xs ${isOnline ? "text-green-500 font-medium" : "text-gray-500"}`}>
              {getLastActiveText(friend.last_active)}
            </p>
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

