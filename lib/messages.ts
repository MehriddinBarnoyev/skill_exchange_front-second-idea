import { createApiClient, getWithBody, handleApiError, API_BASE_URL } from "./api-client"
import type { ChatMessage } from "@/types/chat"

export interface SendMessageParams {
  sender_id: string
  reciever_id: string
  message: string
}

export interface GetMessagesParams {
  userId: string
  receiverId: string
  page?: number
  limit?: number
  before?: string
}

/**
 * Send a message to another user
 */
export async function sendMessage(params: SendMessageParams): Promise<ChatMessage> {
  try {
    const apiClient = createApiClient()
    const response = await apiClient.post<ChatMessage>("/messages", params)
    return response.data
  } catch (error: any) {
    return handleApiError(error, "Failed to send message")
  }
}

/**
 * Get messages between two users with pagination
 * Uses GET with a request body as shown in the provided screenshot
 */
export async function getMessages(
  userId: string,
  receiverId: string,
  page = 1,
  limit = 20,
  before?: string,
): Promise<ChatMessage[]> {
  try {
    // Build request body with pagination
    const requestBody: any = {
      receiver_id: receiverId,
      page,
      limit,
    }

    // Add 'before' timestamp if provided for loading older messages
    if (before) {
      requestBody.before = before
    }

    // Using getWithBody to match the API structure in the screenshot
    return await getWithBody<ChatMessage[]>(`/messages/${userId}`, requestBody, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch messages")
  }
}

/**
 * Mark messages as read
 * @param sender_id The ID of the user who sent the messages
 */
export async function markMessagesAsRead(sender_id: string): Promise<{ success: boolean; message: string }> {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("Authentication token not found")
    }

    const apiClient = createApiClient(token)
    const response = await apiClient.put<{ success: boolean; message: string }>("/messages/mark-as-read", {
      sender_id,
    })
    return response.data
  } catch (error: any) {
    return handleApiError(error, "Failed to mark messages as read")
  }
}

/**
 * Get conversation by match ID
 */
export async function getConversation(token: string, matchId: string): Promise<ChatMessage[]> {
  try {
    const apiClient = createApiClient(token)
    const response = await apiClient.get<ChatMessage[]>(`/messages/conversation/${matchId}`)
    return response.data
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch conversation")
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(token: string, messageId: string): Promise<{ message: string }> {
  try {
    const apiClient = createApiClient(token)
    const response = await apiClient.delete<{ message: string }>(`/messages/${messageId}`)
    return response.data
  } catch (error: any) {
    return handleApiError(error, "Failed to delete message")
  }
}

// Export the API base URL for use in components
export const API_URL = API_BASE_URL

// Export Message type for use in components
export type { ChatMessage as Message }

