import axios from "axios"

const API_URL = "http://localhost:5000/api"

export interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  sender_name: string
  sender_profile_pic: string
  receiver_id: string
  receiver_name: string
  receiver_profile_pic: string
}

export interface SendMessageParams {
  sender_id: string
  reciever_id: string
  message: string
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

/**
 * Send a message to another user
 */
export async function sendMessage( params: SendMessageParams, user_id:string): Promise<Message> {
  try {
    const response = await api.post<Message>(`/messages/${user_id}`, params)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to send message")
  }
}

/**
 * Get messages between two users
 */
export async function getMessages( userId: string, receiverId: string): Promise<Message[]> {
  try {
    const response = await api.post<Message[]>(
      `/messages/${userId}`,
      { reciever_id: receiverId },

    )
    console.log(response.data);

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch messages")
  }
}

/**
 * Get conversation by match ID
 */
export async function getConversation(token: string, matchId: string): Promise<Message[]> {
  try {
    const response = await api.get<Message[]>(`/messages/conversation/${matchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch conversation")
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(token: string, messageId: string): Promise<{ message: string }> {
  try {
    const response = await api.delete<{ message: string }>(`/messages/${messageId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete message")
  }
}

