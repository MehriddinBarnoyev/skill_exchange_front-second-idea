import axios from "axios"

const API_URL = "http://localhost:5000/api"

export interface User {
  id: string
  name: string
  email: string
  bio?: string
  profilePicture?: string
  location?: string
  profession?: string
  education?: string
  birth_date?: string
  interests?: string
  created_at: string
  skills: Skill[]
}

export interface Skill {
  id: string
  name: string
  description: string
  level?: string
}

export async function getUserProfile(userId: string): Promise<User> {
  try {
    const response = await axios.get<User>(`${API_URL}/userProfiles/${userId}`)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch user profile")
  }
}

