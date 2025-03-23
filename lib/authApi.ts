import axios, { type AxiosError } from "axios"

const API_URL = "http://localhost:5010/api"

// Types based on the API response
export interface AuthResponse {
  message: string
  token?: string
  user_id?: string
  user?: {
    id: string
    name: string
    email: string
  }
  isExistingUser?: boolean
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
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string }>
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

export async function verifyOTP(email: string, otp: string, user_id: string): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/verify-otp", { email, otp, user_id })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string }>
      throw new Error(axiosError.response?.data?.error || "OTP verification failed")
    }
    throw new Error("An unexpected error occurred during OTP verification")
  }
}

export async function verifyOtp(email: string, otp: string, user_id?: string): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/verify-otp", { email, otp, user_id })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string }>
      throw new Error(axiosError.response?.data?.error || "OTP verification failed")
    }
    throw new Error("An unexpected error occurred during OTP verification")
  }
}

export async function initiateLogin(email: string): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/login", { email })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string }>
      throw new Error(axiosError.response?.data?.error || "Login failed")
    }
    throw new Error("An unexpected error occurred")
  }
}

