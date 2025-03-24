"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { useVirtualScroll } from "@/hooks/useVirtualScroll"
import type { Friend } from "@/types/chat"
import { API_URL } from "@/lib/messages"

interface VirtualizedFriendsListProps {
  friends: Friend[]
  selectedFriendId: string | null
  onSelectFriend: (friend: Friend) => void
  onLoadMoreFriends?: () => Promise<void>
  hasMoreFriends?: boolean
}

export function VirtualizedFriendsList({
  friends,
  selectedFriendId,
  onSelectFriend,
  onLoadMoreFriends,
  hasMoreFriends = false,
}: VirtualizedFriendsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const FRIEND_ITEM_HEIGHT = 72 // Height of each friend item in pixels

  const filteredFriends = useMemo(() => {
    return friends.filter(
      (friend) =>
        friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.profession?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [friends, searchTerm])

  const { containerRef, visibleItems, topPadding, bottomPadding, isLoadingMore } = useVirtualScroll({
    items: filteredFriends,
    itemHeight: FRIEND_ITEM_HEIGHT,
    loadMoreItems: onLoadMoreFriends,
    overscan: 5,
  })

  const isUserActive = (lastActive: string | undefined) => {
    if (!lastActive) return false
    // Consider active if last active within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return new Date(lastActive) > fiveMinutesAgo
  }

  return (
    <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Messages</h2>
        <Input
          placeholder="Search contacts..."
          className="mt-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {filteredFriends.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? "No matching contacts found" : "No contacts found. Add friends to start chatting!"}
          </div>
        ) : (
          <>
            <div style={{ height: topPadding }} />
            {visibleItems.map((friend) => (
              <div
                key={friend.id}
                className={`p-3 flex items-center hover:bg-gray-50 cursor-pointer ${
                  selectedFriendId === friend.id ? "bg-gray-100" : ""
                }`}
                style={{ height: FRIEND_ITEM_HEIGHT }}
                onClick={() => onSelectFriend(friend)}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
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
            ))}
            <div style={{ height: bottomPadding }} />
            {isLoadingMore && (
              <div className="p-4 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

