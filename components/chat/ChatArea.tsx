/**
 * ChatArea component
 * Container for the active chat conversation
 */
import { ChatHeader } from "@/components/chat/ChatHeader"
import { MessageList } from "@/components/chat/MessageList"
import { MessageInput } from "@/components/chat/MessageInput"
import type { Friend } from "@/components/chat/FriendsList"
import type { Message } from "@/lib/messages"

interface ChatAreaProps {
  friend: Friend
  messages: Message[]
  userId: string | null
  apiUrl: string
  isMobileView: boolean
  showFriendsList: boolean
  isTyping: boolean
  isOnline: boolean
  onBackToFriendsList: () => void
  onSendMessage: (message: string) => Promise<void>
  onInputChange: (value: string) => void
  onMessagesRead: () => Promise<void>
}

export function ChatArea({
  friend,
  messages,
  userId,
  apiUrl,
  isMobileView,
  showFriendsList,
  isTyping,
  isOnline,
  onBackToFriendsList,
  onSendMessage,
  onInputChange,
  onMessagesRead,
}: ChatAreaProps) {
  return (
    <div className="flex-1 flex flex-col h-full">
      <ChatHeader
        friend={friend}
        isMobileView={isMobileView}
        showFriendsList={showFriendsList}
        onBackToFriendsList={onBackToFriendsList}
        isOnline={isOnline}
      />
      <MessageList
        messages={messages}
        userId={userId}
        apiUrl={apiUrl}
        onMessagesRead={onMessagesRead}
        isTyping={isTyping}
      />
      <MessageInput onSendMessage={onSendMessage} onInputChange={onInputChange} />
    </div>
  )
}

