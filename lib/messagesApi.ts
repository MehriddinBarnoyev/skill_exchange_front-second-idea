import axios from "axios"

const API_URL = "http://localhost:5000/api"

// Types
export interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  sender_name: string
  sender_profile_picture: string | null
  receiver_id: string
  receiver_name: string
  receiver_profile_picture: string | null
}

export interface SendMessageRequest {
  sender_id: string
  receiver_id: string
  message: string
}

// API client with authentication
const apiClient = (token: string) => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
}

export const messagesApi = {
  // Get all messages for a conversation between two users
  getMessages: async (userId: string, token: string): Promise<Message[]> => {
    try {
      const response = await apiClient(token).get(`/messages/${userId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching messages:", error)
      throw handleApiError(error, "Failed to fetch messages")
    }
  },

  // Send a new message
  sendMessage: async (data: SendMessageRequest, token: string): Promise<Message> => {
    try {
      const response = await apiClient(token).post("/messages", data)
      return response.data
    } catch (error) {
      console.error("Error sending message:", error)
      throw handleApiError(error, "Failed to send message")
    }
  },
}

// Error handling helper
function handleApiError(error: any, defaultMessage: string): Error {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const errorMessage = error.response?.data?.error || error.response?.data?.message

    if (status === 401) {
      return new Error("Authentication required. Please log in again.")
    } else if (status === 403) {
      return new Error("You don't have permission to perform this action.")
    } else if (status === 404) {
      return new Error("The requested resource was not found.")
    } else if (errorMessage) {
      return new Error(errorMessage)
    }
  }

  return new Error(defaultMessage)
}

