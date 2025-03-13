import axios from "axios"

const API_URL = "http://localhost:5000/api"

export interface AuthResponse {
  token: string
  user: User
}

export interface User {
  education: string
  birth_date: any
  interests: string
  profession: string
  location: string
  id: string
  name: string
  email: string
  bio: string
  profilePicture: string
}

export interface Skill {
  id: string
  name: string
  description: string
  level?: "beginner" | "intermediate" | "advanced"
}

export interface SkillWithUser extends Skill {
  profile_pic: any
  skill_name(skill_name: any): import("react").ReactNode
  user_name(user_name: any): unknown
  user_id: any
  username: string
  createdAt: string
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export async function getUserInfo(token: string, userId?: string): Promise<User> {
  try {
    const response = await api.get<User>(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to fetch user!"
    throw new Error(errorMessage)
  }
}

export async function getUserSkills(token: string, userId?: string): Promise<{ skills: Skill[] }> {
  try {
    const response = await api.get<{ skills: Skill[] }>(`/skills/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to fetch user skills"
    throw new Error(errorMessage)
  }
}

export async function updateUserProfile(token: string, userData: User): Promise<User> {
  try {
    const response = await api.put(`/users/${userData.id}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update user profile")
  }
}

export async function addSkill(
  token: string,
  userId: string,
  skill: { name: string; description: string; level?: "beginner" | "intermediate" | "advanced" | "expert" },
): Promise<Skill> {
  try {
    const response = await api.post<Skill>(`/skills/addskill/${userId}`, skill, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to add skill")
  }
}

export async function updateSkill(token: string, skillId: string, skill: Partial<Skill>): Promise<Skill> {
  try {
    const response = await api.put<Skill>(`/skills/${skillId}`, skill, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update skill")
  }
}

export async function deleteSkill(token: string, skillId: string): Promise<void> {
  try {
    await api.delete(`/skills/${skillId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete skill")
  }
}

export async function getAllSkillsWithUsers(token: string): Promise<SkillWithUser[]> {
  try {
    const response = await api.get<SkillWithUser[]>("/skills", {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch all skills with users")
  }
}

export async function getAllSkills(token: string): Promise<Skill[]> {
  try {
    const response = await api.get<Skill[]>("/skills", {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch all skills")
  }
}

export async function removeUserSkill(token: string, skillId: string): Promise<void> {
  try {
    await api.delete(`/skills/${skillId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete skill")
  }
}

export async function getUserMatches(userId: string, token: string): Promise<any> {
  try {
    const response = await api.get(`/users/${userId}/matches`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch user matches")
  }
}

export async function getUserReviews(userId: string, token: string): Promise<any> {
  try {
    const response = await api.get(`/users/${userId}/reviews`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch user reviews")
  }
}

export async function uploadProfileImage(token: string, file: File, user_id: string): Promise<string> {
  const formData = new FormData()
  formData.append("profile_image", file)

  try {
    const response = await api.post(`/users/upload-profile-image/${user_id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data.imagePath
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to upload profile image")
  }
}

export async function completeUserProfile(token: string, user_id: string, formData: { location: string; profession: string; gender: string; education: string; birth_date: string; interests: string }): Promise<User> {
  try {
    const response = await api.post(`/users/complete-profile/${user_id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to complete user profile")
  }
}