import { register, login, verifyOTP } from "./authApi"
import { toast } from "@/components/ui/use-toast"

interface UserInput {
  name?: string
  email: string
  password: string
}

export const handleRegistration = async (input: UserInput) => {
  try {
    // Input validation
    if (!input.name || !input.email || !input.password) {
      throw new Error("Please fill in all required fields")
    }
    if (!isValidEmail(input.email)) {
      throw new Error("Please enter a valid email address")
    }
    if (input.password.length < 8) {
      throw new Error("Password must be at least 8 characters long")
    }

    const response = await register(input.name, input.email, input.password)

    if (response.isExistingUser) {
      toast({
        title: "User Already Exists",
        description: "An OTP has been sent to your email for verification.",
      })
      return { success: true, isExistingUser: true }
    } else {
      toast({
        title: "Registration Successful",
        description: "Please check your email for the verification code.",
      })
      return { success: true, isExistingUser: false }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Registration failed"
    toast({
      title: "Registration Failed",
      description: errorMessage,
      variant: "destructive",
    })
    return { success: false, error: errorMessage }
  }
}

export const handleLogin = async (input: UserInput) => {
  try {
    // Input validation
    if (!input.email || !input.password) {
      throw new Error("Please enter both email and password")
    }
    if (!isValidEmail(input.email)) {
      throw new Error("Please enter a valid email address")
    }

    const response = await login(input.email, input.password)

    toast({
      title: "Login Successful",
      description: "You have been successfully logged in.",
    })
    return { success: true, token: response.token, user: response.user }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Login failed"
    toast({
      title: "Login Failed",
      description: errorMessage,
      variant: "destructive",
    })
    return { success: false, error: errorMessage }
  }
}

export const handleOTPVerification = async (email: string, otp: string) => {
  try {
    // Input validation
    if (!email || !otp) {
      throw new Error("Please enter both email and OTP")
    }
    if (!isValidEmail(email)) {
      throw new Error("Please enter a valid email address")
    }
    if (otp.length !== 6) {
      throw new Error("OTP must be 6 digits long")
    }

    const response = await verifyOTP(email, otp)

    toast({
      title: "OTP Verification Successful",
      description: "Your account has been verified.",
    })
    return { success: true, token: response.token, user: response.user }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "OTP verification failed"
    toast({
      title: "OTP Verification Failed",
      description: errorMessage,
      variant: "destructive",
    })
    return { success: false, error: errorMessage }
  }
}

// Helper function to validate email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

