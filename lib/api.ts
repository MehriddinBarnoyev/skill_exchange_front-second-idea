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
  username: string
  createdAt: string
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
    })
    return response.data
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Registration failed!"
    throw new Error(errorMessage)
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    // Add request logging
    console.log("Attempting login for email:", email)

    const response = await api.post<AuthResponse>(
      "/auth/login",
      {
        email,
        password,
      },
      {
        // Add detailed error handling
        validateStatus: (status) => {
          return status < 500 // Accept any status code less than 500
        },
      },
    )

    // Log successful response
    console.log("Login response status:", response.status)

    if (response.status !== 200) {
      // Handle non-500 errors explicitly
      throw new Error(response.data?.message || `Login failed with status ${response.status}`)
    }

    return response.data
  } catch (error: any) {
    // Enhanced error logging
    console.error("Login error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    })

    // More specific error messages based on error type
    if (error.response?.status === 401) {
      throw new Error("Invalid email or password")
    } else if (error.response?.status === 404) {
      throw new Error("User not found")
    } else if (error.response?.status === 500) {
      throw new Error("Server error. Please try again later")
    }

    // Generic error fallback
    throw new Error(error.response?.data?.message || "Login failed. Please try again")
  }
}

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
  skill: { name: string; description: string; level?: "beginner" | "intermediate" | "advanced" },
): Promise<Skill> {
  try {
    const response = await api.post<Skill>(`/users/${userId}/skills`, skill, {
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