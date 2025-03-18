import axios from "axios"

const API_URL = "http://localhost:5000/api"

export interface Connection {
  id: string
  connected_user_id: string
  connected_user_name: string
  connected_user_profession: string
  connected_user_profile_pic: string
}

export interface ConnectionRequest {
  id: number
  sender_id: string
  receiver_id: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
}

export interface ConnectionResponse {
  success: boolean
  message: string
  connection?: Connection
}

// Setup axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

/**
 * Send a connection request to another user
 */
export async function sendConnectionRequest(
  token: string,
  sender_id: string,
  receiver_id: string,
): Promise<ConnectionResponse> {
  try {
    const response = await api.post<ConnectionResponse>(
      "/connections/request",
      { sender_id, receiver_id },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to send connection request")
  }
}

/**
 * Get all connection requests for a user
 */
export async function getConnectionRequests(token: string, user_id: string): Promise<ConnectionRequest[]> {
  try {
    const response = await api.get<ConnectionRequest[]>(`/connections/requests/${user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch connection requests")
  }
}

/**
 * Respond to a connection request (accept or reject)
 */
export async function respondToConnectionRequest(
  token: string,
  request_id: number,
  action: "accepted" | "rejected",
): Promise<ConnectionResponse> {
  try {
    const response = await api.post<ConnectionResponse>(
      "/connections/respond",
      { request_id, action },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to respond to connection request")
  }
}

/**
 * Get all connections (friends) for a user
 */
export async function getFriends(user_id: string): Promise<Connection[]> {
  try {
    const response = await api.get<Connection[]>(`/connections/friends/${user_id}`)

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch friends")
  }
}

/**
 * Delete a friend connection
 */
export async function deleteFriend(
  token: string,
  user_id: string,
  friend_id: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete(`/connections/${user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { friend_id }, // Send friend_id in the request body
    })
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Connection not found")
    }
    throw new Error(error.response?.data?.message || "Failed to delete friend")
  }
}

