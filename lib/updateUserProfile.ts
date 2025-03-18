import type { User } from "@/lib/api"

export interface UpdateProfileOptions {
  requiredFields?: string[]
  validators?: { [key: string]: (value: any) => string | null }
  maxFieldLength?: number
}

export interface UpdateProfileResult {
  success: boolean
  profile?: User
  message?: string
  errors?: { [key: string]: string }
}

export const profileValidators = {
  name: (value: string) => {
    if (!value || value.trim() === "") return "Name is required"
    if (value.length < 2) return "Name must be at least 2 characters"
    if (value.length > 50) return "Name must be less than 50 characters"
    return null
  },
  email: (value: string) => {
    if (!value || value.trim() === "") return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return "Please enter a valid email address"
    return null
  },
  birth_date: (value: string) => {
    if (!value) return null // Birth date is optional

    const date = new Date(value)
    if (isNaN(date.getTime())) return "Please enter a valid date"

    const now = new Date()
    if (date > now) return "Birth date cannot be in the future"

    const minDate = new Date("1900-01-01")
    if (date < minDate) return "Birth date is too far in the past"

    return null
  },
  profilePicture: (value: string) => {
    if (!value) return null // Profile picture is optional
    return null
  },
  interests: (value: string) => {
    if (!value) return null // Interests are optional
    if (value.length > 500) return "Interests must be less than 500 characters"
    return null
  },
  bio: (value: string) => {
    if (!value) return null // Bio is optional
    if (value.length > 500) return "Bio must be less than 500 characters"
    return null
  },
  location: (value: string) => {
    if (!value) return null // Location is optional
    if (value.length > 100) return "Location must be less than 100 characters"
    return null
  },
  profession: (value: string) => {
    if (!value) return null // Profession is optional
    if (value.length > 100) return "Profession must be less than 100 characters"
    return null
  },
  gender: (value: string) => {
    if (!value) return null // Gender is optional
    const validGenders = ["male", "female", "other", "prefer_not_to_say"]
    if (!validGenders.includes(value)) return "Please select a valid gender"
    return null
  },
}

export function updateUserProfile(
  originalUser: User,
  editedUser: User,
  options: UpdateProfileOptions = {},
): UpdateProfileResult {
  const { requiredFields = [], validators = {}, maxFieldLength = 500 } = options

  // Check for required fields
  const errors: { [key: string]: string } = {}

  for (const field of requiredFields) {
    if (!editedUser[field as keyof User]) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
    }
  }

  // Apply validators
  for (const [field, validator] of Object.entries(validators)) {
    const value = editedUser[field as keyof User]
    const error = validator(value)
    if (error) {
      errors[field] = error
    }
  }

  // Check field lengths
  for (const [key, value] of Object.entries(editedUser)) {
    if (typeof value === "string" && value.length > maxFieldLength) {
      errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} must be less than ${maxFieldLength} characters`
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: "Please fix the validation errors",
    }
  }

  // Return the updated profile
  return {
    success: true,
    profile: editedUser,
  }
}

