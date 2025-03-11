/**
 * Updates a user's profile while preserving the email address.
 *
 * This function accepts the current user profile and new profile data,
 * validates the input, merges the data while ensuring the email remains unchanged,
 * and returns a result object with success status and relevant data.
 *
 * @param currentProfile - The user's current profile data
 * @param newProfileData - The new profile data to be applied
 * @param options - Optional configuration parameters
 * @returns An object containing success status, updated profile, and any error messages
 */
export interface UserProfile {
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
  is_profile_complete?: boolean
  [key: string]: any // Allow for additional fields
}

export interface UpdateProfileOptions {
  /** Fields that should be validated as required */
  requiredFields?: string[]
  /** Fields that should be excluded from the update (email is always excluded) */
  excludedFields?: string[]
  /** Custom validation functions for specific fields */
  validators?: {
    [field: string]: (value: any) => { valid: boolean; message?: string }
  }
  /** Maximum allowed length for string fields */
  maxFieldLength?: number
}

export interface UpdateProfileResult {
  success: boolean
  profile?: UserProfile
  errors?: {
    [field: string]: string
  }
  message?: string
}

/**
 * Updates a user profile while preserving the email address
 */
export function updateUserProfile(
  currentProfile: UserProfile,
  newProfileData: Partial<UserProfile>,
  options: UpdateProfileOptions = {},
): UpdateProfileResult {
  // Initialize result
  const result: UpdateProfileResult = {
    success: false,
  }

  // Validate inputs
  if (!currentProfile || typeof currentProfile !== "object") {
    return {
      success: false,
      message: "Current profile is required and must be an object",
    }
  }

  if (!newProfileData || typeof newProfileData !== "object") {
    return {
      success: false,
      message: "New profile data is required and must be an object",
    }
  }

  // Initialize errors object
  const errors: { [field: string]: string } = {}

  // Ensure email is preserved by removing it from newProfileData
  const sanitizedNewData = { ...newProfileData }
  delete sanitizedNewData.email

  // Add any additional excluded fields from options
  if (options.excludedFields && Array.isArray(options.excludedFields)) {
    options.excludedFields.forEach((field) => {
      delete sanitizedNewData[field]
    })
  }

  // Validate required fields
  if (options.requiredFields && Array.isArray(options.requiredFields)) {
    options.requiredFields.forEach((field) => {
      // Skip email as it's not being updated
      if (field === "email") return

      // Check if field exists in new data or current profile
      const value = sanitizedNewData[field] !== undefined ? sanitizedNewData[field] : currentProfile[field]

      if (value === undefined || value === null || value === "") {
        errors[field] = `${field} is required`
      }
    })
  }

  // Validate field types and apply custom validators
  for (const [field, value] of Object.entries(sanitizedNewData)) {
    // Skip null or undefined values (they'll be ignored in the merge)
    if (value === null || value === undefined) continue

    // Type validation
    if (typeof currentProfile[field] === "string" && typeof value !== "string") {
      errors[field] = `${field} must be a string`
    } else if (typeof currentProfile[field] === "number" && typeof value !== "number") {
      errors[field] = `${field} must be a number`
    } else if (typeof currentProfile[field] === "boolean" && typeof value !== "boolean") {
      errors[field] = `${field} must be a boolean`
    }

    // String length validation
    if (typeof value === "string" && options.maxFieldLength && value.length > options.maxFieldLength) {
      errors[field] = `${field} exceeds maximum length of ${options.maxFieldLength} characters`
    }

    // Custom validators
    if (options.validators && options.validators[field]) {
      const validationResult = options.validators[field](value)
      if (!validationResult.valid) {
        errors[field] = validationResult.message || `Invalid ${field}`
      }
    }
  }

  // If there are validation errors, return them
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: "Validation failed",
    }
  }

  try {
    // Merge the current profile with the new data, preserving the email
    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...sanitizedNewData,
      email: currentProfile.email, // Ensure email is preserved
    }

    // Return success result with updated profile
    return {
      success: true,
      profile: updatedProfile,
      message: "Profile updated successfully",
    }
  } catch (error) {
    // Handle any unexpected errors
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

/**
 * Common validators for profile fields
 */
export const profileValidators = {
  name: (value: string) => ({
    valid: typeof value === "string" && value.trim().length >= 2,
    message: "Name must be at least 2 characters",
  }),

  birth_date: (value: string) => {
    const date = new Date(value)
    const isValidDate = !isNaN(date.getTime())
    const isPastDate = date < new Date()

    return {
      valid: isValidDate && isPastDate,
      message: !isValidDate ? "Invalid date format" : !isPastDate ? "Date must be in the past" : undefined,
    }
  },

  interests: (value: string) => ({
    valid: typeof value === "string",
    message: "Interests must be a string",
  }),

  profilePicture: (value: string) => ({
    valid: typeof value === "string" && (value === "" || value.startsWith("http")),
    message: "Profile picture must be a valid URL",
  }),
}

