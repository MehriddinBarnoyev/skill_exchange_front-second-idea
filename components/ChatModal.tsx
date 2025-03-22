// "use client"

// import type React from "react"

// import { useState, useEffect, useRef } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { X, Send, Loader2 } from "lucide-react"

// interface Message {
//   id: string
//   senderId: string
//   content: string
//   timestamp: string
// }

// interface ChatModalProps {
//   isOpen: boolean
//   onClose: () => void
//   friendId: string
//   friendName: string
//   friendAvatar?: string
// }

// export function ChatModal({ isOpen, onClose, friendId, friendName, friendAvatar }: ChatModalProps) {
//   const [messages, setMessages] = useState<Message[]>([])
//   const [newMessage, setNewMessage] = useState("")
//   const [isLoading, setIsLoading] = useState(true)
//   const [isSending, setIsSending] = useState(false)
//   const scrollAreaRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     if (isOpen) {
//       // For demo purposes, we'll add some mock messages
//       setMessages([
//         {
//           id: "1",
//           senderId: "current-user",
//           content: "Hey, how are you?",
//           timestamp: new Date(Date.now() - 3600000).toISOString(),
//         },
//         {
//           id: "2",
//           senderId: friendId,
//           content: "I'm good, thanks! How about you?",
//           timestamp: new Date(Date.now() - 3000000).toISOString(),
//         },
//       ])
//       setIsLoading(false)
//     }
//   }, [isOpen, friendId])

//   useEffect(() => {
//     // Scroll to bottom when new messages arrive
//     if (scrollAreaRef.current) {
//       scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
//     }
//   }, [messages])

//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!newMessage.trim()) return

//     setIsSending(true)
//     // Here you would integrate with your chat API
//     // For now, we'll just simulate sending a message
//     setTimeout(() => {
//       setMessages([
//         ...messages,
//         {
//           id: Date.now().toString(),
//           senderId: "current-user",
//           content: newMessage,
//           timestamp: new Date().toISOString(),
//         },
//       ])
//       setNewMessage("")
//       setIsSending(false)
//     }, 500)
//   }

//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-lg w-full max-w-lg h-[600px] flex flex-col">
//         {/* Chat header */}
//         <div className="flex items-center justify-between p-4 border-b">
//           <div className="flex items-center space-x-3">
//             <Avatar>
//               <AvatarImage src={friendAvatar} />
//               <AvatarFallback>{friendName[0]}</AvatarFallback>
//             </Avatar>
//             <div>
//               <h2 className="font-semibold">{friendName}</h2>
//               <p className="text-sm text-gray-500">{isLoading ? "Loading..." : "Active now"}</p>
//             </div>
//           </div>
//           <Button variant="ghost" size="icon" onClick={onClose}>
//             <X className="h-5 w-5" />
//           </Button>
//         </div>

//         {/* Chat messages */}
//         <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
//           {isLoading ? (
//             <div className="flex justify-center items-center h-full">
//               <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {messages.map((message) => (
//                 <div
//                   key={message.id}
//                   className={`flex ${message.senderId === "current-user" ? "justify-end" : "justify-start"}`}
//                 >
//                   <div
//                     className={`max-w-[70%] rounded-lg p-3 ${
//                       message.senderId === "current-user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
//                     }`}
//                   >
//                     <p>{message.content}</p>
//                     <p className="text-xs mt-1 opacity-70">{new Date(message.timestamp).toLocaleTimeString()}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </ScrollArea>

//         {/* Message input */}
//         <form onSubmit={handleSendMessage} className="p-4 border-t">
//           <div className="flex space-x-2">
//             <Input
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               placeholder="Type a message..."
//               className="flex-1"
//             />
//             <Button type="submit" disabled={isSending}>
//               {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

