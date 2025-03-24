/**
 * ChatContainer component
 * Main container for the chat interface
 */
import { Card } from "@/components/ui/card"
import { FriendsList } from "@/components/chat/FriendsList"
import { EmptyChatState } from "@/components/chat/EmptyChatState"
import type { Friend } from "@/components/chat/FriendsList"
import type { Message } from "@/lib/messages"
import { ChatArea } from "./ChatArea"

interface ChatContainerProps {
  friends: Friend[]
  selectedFriend: Friend | null
  messages: Message[]
  userId: string | null
  apiUrl: string
  isMobileView: boolean
  showFriendsList: boolean
  onlineUsers: string[]
  typingUsers: Record<string, boolean>
  onSelectFriend: (friend: Friend) => void
  onBackToFriendsList: () => void
  onSendMessage: (message: string) => Promise<void>
  onInputChange: (value: string) => void
  onMessagesRead: () => Promise<void>
}

export function ChatContainer({
  friends,
  selectedFriend,
  messages,
  userId,
  apiUrl,
  isMobileView,
  showFriendsList,
  onlineUsers,
  typingUsers,
  onSelectFriend,
  onBackToFriendsList,
  onSendMessage,
  onInputChange,
  onMessagesRead,
}: ChatContainerProps) {

    
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <Card className="h-full flex flex-col md:flex-row overflow-hidden">
        {/* Friends List - Hidden on mobile when chat is open */}
        {(showFriendsList || !isMobileView) && (
          <FriendsList
            friends={friends}
            selectedFriendId={selectedFriend?.id || null}
            onSelectFriend={onSelectFriend}
            onlineUsers={onlineUsers}
          />
        )}

        {/* Chat Area */}
        {selectedFriend ? (
          <ChatArea
            friend={selectedFriend}
            messages={messages}
            userId={userId}
            apiUrl={apiUrl}
            isMobileView={isMobileView}
            showFriendsList={showFriendsList}
            isTyping={typingUsers[selectedFriend.id] || false}
            isOnline={onlineUsers.includes(selectedFriend.id)}
            onBackToFriendsList={onBackToFriendsList}
            onSendMessage={onSendMessage}
            onInputChange={onInputChange}
            onMessagesRead={onMessagesRead}
          />
        ) : (
          <EmptyChatState />
        )}
      </Card>
    </div>
  )
}

