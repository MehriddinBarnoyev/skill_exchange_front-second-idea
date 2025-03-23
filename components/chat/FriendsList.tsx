"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export interface Friend {
  id: string
  connectionId: string
  name: string
  profession: string
  profile_pic: string
  last_message?: string
  last_message_time?: string
  unread_count?: number
  last_active?: string
  created_at?: string
}

interface FriendsListProps {
  friends: Friend[]
  selectedFriendId: string | null
  onSelectFriend: (friend: Friend) => void
}

export function FriendsList({ friends, selectedFriendId, onSelectFriend }: FriendsListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredFriends = useMemo(() => {
    return friends
      .filter(
        (friend) =>
          friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          friend.profession?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
  }, [friends, searchTerm])

  const isUserActive = (lastActive: string | undefined) => {
    if (!lastActive) return false
    // Consider active if last active within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return new Date(lastActive) > fiveMinutesAgo
  }

  return (
    <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Messages</h2>
        <Input
          placeholder="Search contacts..."
          className="mt-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="divide-y divide-gray-100">
        {filteredFriends.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? "No matching contacts found" : "No contacts found. Add friends to start chatting!"}
          </div>
        ) : (
          filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className={`p-3 flex items-center hover:bg-gray-50 cursor-pointer ${
                selectedFriendId === friend.id ? "bg-gray-100" : ""
              } ${friend.unread_count && friend.unread_count > 0 ? "bg-blue-50" : ""}`}
              onClick={() => onSelectFriend(friend)}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={friend.profile_pic} alt={friend.name} />
                  <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {isUserActive(friend.last_active) && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <h3
                    className={`font-medium ${friend.unread_count && friend.unread_count > 0 ? "font-semibold text-black" : ""}`}
                  >
                    {friend.name}
                  </h3>
                  {friend.last_message_time && (
                    <span className="text-xs text-gray-500">{friend.last_message_time}</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <p
                    className={`text-sm truncate max-w-[150px] ${
                      friend.unread_count && friend.unread_count > 0 ? "text-black font-medium" : "text-gray-500"
                    }`}
                  >
                    {friend.last_message || friend.profession || "No profession"}
                  </p>
                  {friend.unread_count && friend.unread_count > 0 && (
                    <Badge className="bg-primary text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                      {friend.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

