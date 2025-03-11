import axios from "axios"

const API_URL = "http://localhost:5000/api"

const apiClient = (token: string) => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
}

export const sendConnectionRequest = async (token: string, senderId: string, receiverId: string) => {
  try {
    await apiClient(token).post("/connections/request", { sender_id: senderId, receiver_id: receiverId })
  } catch (error) {
    console.error("Error sending connection request:", error)
    throw error
  }
}

