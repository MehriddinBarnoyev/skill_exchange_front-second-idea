import axios from "axios"

const API_URL = "http://localhost:5000/api"

export interface ConnectionRequest {
  id: number
  sender_id: string
  receiver_id: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export async function sendConnectionRequest(
  token: string,
  sender_id: string,
  receiver_id: string,
): Promise<ConnectionRequest> {
  try {
    const response = await api.post<ConnectionRequest>(
      "/connections/request",
      { sender_id, receiver_id },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to send connection request")
  }
}

export async function getConnectionRequests(token: string, user_id: string): Promise<ConnectionRequest[]> {
  try {
    const response = await api.get<ConnectionRequest[]>(`/connections/${user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch connection requests")
  }
}

export async function respondToConnectionRequest(
  token: string,
  request_id: number,
  action: "accepted" | "rejected",
): Promise<ConnectionRequest> {
  try {
    const response = await api.post<ConnectionRequest>(
      "/connections/respond",
      { request_id, action },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to respond to connection request")
  }
}

