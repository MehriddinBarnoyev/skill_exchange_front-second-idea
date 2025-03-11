import axios from "axios"

const API_URL = "http://localhost:5000/api"

// Types
export interface ConnectionRequest {
  id: string
  sender_id: string
  receiver_id: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
  sender_name: string
  sender_profile_picture?: string
  sender_profession?: string
}

export interface Connection {
  id: string
  connected_user_id: string
  connected_user_name: string
  connected_user_profile_picture?: string
  connected_user_profession?: string
  status: "accepted"
  created_at: string
}

export interface User {
  id: string
  name: string
  email: string
  profilePicture?: string
  bio?: string
  is_profile_complete?: boolean
  location?: string
  profession?: string
  education?: string
  birth_date?: string
  interests?: string
}

export interface Skill {
  id: string
  name: string
  description: string
  level?: string
}

export interface SkillWithUser extends Skill {
  user_id: string
  user_name: string
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

// User API functions
export const getUserInfo = async (token: string, userId: string): Promise<User> => {
  try {
    const response = await apiClient(token).get(`/users/${userId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching user info:", error)
    throw error // Re-throw the error for handling in the calling function
  }
}

export const updateUserProfile = async (token: string, user: User): Promise<User> => {
  try {
    const response = await apiClient(token).put(`/users/${user.id}`, user)
    return response.data
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

export const completeUserProfile = async (token: string, userId: string, formData: any): Promise<User> => {
  try {
    const response = await apiClient(token).post(`/users/complete-profile/${userId}`, formData)
    return response.data
  } catch (error) {
    console.error("Error completing user profile:", error)
    throw error
  }
}

export const getUserSkills = async (token: string, userId: string): Promise<Skill[]> => {
  try {
    const response = await apiClient(token).get(`/skills/${userId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching user skills:", error)
    throw error
  }
}

export const addSkill = async (token: string, userId: string, skill: Skill): Promise<Skill> => {
  try {
    const response = await apiClient(token).post(`/skills/${userId}`, skill)
    return response.data
  } catch (error) {
    console.error("Error adding skill:", error)
    throw error
  }
}

export const updateSkill = async (token: string, skillId: string, skill: Skill): Promise<Skill> => {
  try {
    const response = await apiClient(token).put(`/skills/${skillId}`, skill)
    return response.data
  } catch (error) {
    console.error("Error updating skill:", error)
    throw error
  }
}

export const deleteSkill = async (token: string, skillId: string): Promise<void> => {
  try {
    await apiClient(token).delete(`/skills/${skillId}`)
  } catch (error) {
    console.error("Error deleting skill:", error)
    throw error
  }
}

export const getAllSkillsWithUsers = async (token: string): Promise<SkillWithUser[]> => {
  try {
    const response = await apiClient(token).get("/skills")
    return response.data
  } catch (error) {
    console.error("Error fetching all skills with users:", error)
    throw error
  }
}

export const connectionApi = {
  getConnectionRequests: async (userId: string, token: string): Promise<ConnectionRequest[]> => {
    try {
      const response = await apiClient(token).get(`/connections/${userId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching connection requests:", error)
      throw handleApiError(error, "Failed to fetch connection requests")
    }
  },
  sendConnectionRequest: async (
    senderId: string,
    receiverId: string,
    token: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient(token).post(`/connections/request`, {
        sender_id: senderId,
        receiver_id: receiverId,
      })
      return { success: true, message: "Connection request sent successfully" }
    } catch (error) {
      console.error("Error sending connection request:", error)
      throw handleApiError(error, "Failed to send connection request")
    }
  },
  respondToRequest: async (
    requestId: string,
    action: "accepted" | "rejected",
    token: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient(token).put(`/connections/respond`, { request_id: requestId, action })
      return {
        success: true,
        message: action === "accepted" ? "Connection request accepted" : "Connection request rejected",
      }
    } catch (error) {
      console.error("Error responding to connection request:", error)
      throw handleApiError(error, "Failed to respond to connection request")
    }
  },
  getUserConnections: async (userId: string, token: string): Promise<Connection[]> => {
    try {
      const response = await apiClient(token).get(`/connections/${userId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching user connections:", error)
      throw handleApiError(error, "Failed to fetch connections")
    }
  },
  getUserProfile: async (userId: string, token: string): Promise<User> => {
    try {
      const response = await apiClient(token).get(`/userProfiles/${userId}`)
      console.log(response.data);
      
      return response.data
    } catch (error) {
      console.error("Error fetching user profile:", error)
      throw error
    }
  },
  getFriends: async (userId: string, token: string): Promise<Connection[]> => {
    try {
      const response = await apiClient(token).get(`/connections/friends/${userId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching friends:", error)
      throw handleApiError(error, "Failed to fetch friends")
    }
  },
  deleteFriend: async (
    userId: string,
    friendId: string,
    token: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient(token).delete(`/connections/delete/${friendId}`, {
        data: { friend_id: friendId },
      })
      return response.data
    } catch (error) {
      console.error("Error deleting friend:", error)
      throw handleApiError(error, "Failed to remove friend")
    }
  },
}

// Error handling helper
function handleApiError(error: any, defaultMessage: string): Error {
  if (axios.isAxiosError(error)) {
    // Handle Axios errors
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

