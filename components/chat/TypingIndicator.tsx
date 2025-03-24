/**
 * TypingIndicator component
 * Displays an animated typing indicator when the other user is typing
 */
export function TypingIndicator() {
    return (
      <div className="flex justify-start">
        <div className="bg-gray-100 rounded-lg p-3 flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    )
  }
  
  