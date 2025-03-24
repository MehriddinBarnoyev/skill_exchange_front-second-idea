import { API_BASE_URL, createApiClient, handleApiError } from "./api-client"
import { API_URL } from "./messages"

export interface Connection {
  last_active: string
  created_at: string
  unread_count: number
  last_message: string
  last_message_time: string
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

/**
 * Send a connection request to another user
 */
export async function sendConnectionRequest(
  token: string,
  sender_id: string,
  receiver_id: string,
): Promise<ConnectionResponse> {
  try {
    const apiClient = createApiClient(token)
    const response = await apiClient.post<ConnectionResponse>("/connections/request", { sender_id, receiver_id })
    return response.data
  } catch (error: any) {
    return handleApiError(error, "Failed to send connection request")
  }
}

/**
 * Get all connection requests for a user
 */
export async function getConnectionRequests(token: string, user_id: string): Promise<ConnectionRequest[]> {
  try {
    const apiClient = createApiClient(token)
    const response = await apiClient.get<ConnectionRequest[]>(`/connections/requests/${user_id}`)
    return response.data
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch connection requests")
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
    const apiClient = createApiClient(token)
    const response = await apiClient.post<ConnectionResponse>("/connections/respond", { request_id, action })
    return response.data
  } catch (error: any) {
    return handleApiError(error, "Failed to respond to connection request")
  }
}

/**
 * Get all connections (friends) for a user
 */
export async function getFriends(user_id: string): Promise<Connection[]> {
  // `/connections/friends/${user_id}`
  try {
    const apiClient = createApiClient();
    const response = await apiClient.get<Connection[]>(`/connections/friends/${user_id}`)
    
    return response.data
    
  } catch (error) {
    console.log(error);
    return handleApiError(error, "Failed to fetch friends")
    
  }
}

/**
 * Delete a friend connection
 */
export async function deleteFriend(
  user_id: string,
  friend_id: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const apiClient = createApiClient()
    const response = await apiClient.delete(`/connections/delete/${user_id}`, {
      data: { friend_id }, // Send friend_id in the request body
    })
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Connection not found")
    }
    return handleApiError(error, "Failed to delete friend")
  }
}

