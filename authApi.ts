import axios, { type AxiosError } from "axios"

const API_URL = "http://localhost:5000/api"

export interface AuthResponse {
  token: string
  user: User
  message?: string
  isExistingUser?: boolean
}

export interface User {
  id: string
  name: string
  email: string
  bio: string
  profilePicture: string
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

    // Check if user already exists and OTP was sent
    if (response.data.message === "existing_user") {
      return {
        ...response.data,
        isExistingUser: true,
      }
    }

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string }>
      throw new Error(axiosError.response?.data?.error || "Registration failed!")
    }
    throw new Error("An unexpected error occurred during registration")
  }
}

export async function login(email: string, password: string, otp?: string): Promise<AuthResponse> {
  try {
    console.log("Attempting login for email:", email, "with OTP:", otp ? "provided" : "not provided")

    const response = await api.post<AuthResponse>(
      "/auth/login",
      {
        email,
        password,
        otp,
      },
      {
        validateStatus: (status) => status < 500,
      },
    )

    console.log("Login response status:", response.status)

    if (response.status === 404) {
      throw new Error("User not found. Please check your email or register.")
    }

    if (response.status !== 200) {
      throw new Error(response.data?.error || `Login failed with status ${response.status}`)
    }

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string }>
      console.error("Login error details:", {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message,
      })

      if (axiosError.response?.status === 401) {
        throw new Error(axiosError.response.data?.error || "Invalid credentials")
      } else if (axiosError.response?.status === 404) {
        throw new Error("User not found. Please check your email or register.")
      } else if (axiosError.response?.status === 500) {
        throw new Error("Server error. Please try again later")
      }

      throw new Error(axiosError.response?.data?.error || "Login failed. Please try again")
    }
    throw new Error("An unexpected error occurred during login")
  }
}

