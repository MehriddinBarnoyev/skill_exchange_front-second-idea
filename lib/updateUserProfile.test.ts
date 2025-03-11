/**
 * Unit tests for the updateUserProfile function
 *
 * To run these tests, you would typically use Jest or another testing framework
 */

import { describe, test, expect } from "@jest/globals"
import { updateUserProfile, type UserProfile, profileValidators } from "./updateUserProfile"

describe("updateUserProfile", () => {
  // Sample user profile for testing
  const sampleProfile: UserProfile = {
    id: "123",
    name: "John Doe",
    email: "john@example.com",
    bio: "Software developer",
    location: "New York",
    profession: "Engineer",
    education: "Bachelor in Computer Science",
    birth_date: "1990-01-01",
    interests: "Programming, Reading",
    is_profile_complete: true,
  }

  test("should update profile fields while preserving email", () => {
    const newData = {
      name: "John Smith",
      email: "new-email@example.com", // This should be ignored
      bio: "Senior Software Engineer",
    }

    const result = updateUserProfile(sampleProfile, newData)

    expect(result.success).toBe(true)
    expect(result.profile?.name).toBe("John Smith")
    expect(result.profile?.bio).toBe("Senior Software Engineer")
    expect(result.profile?.email).toBe("john@example.com") // Email should remain unchanged
  })

  test("should fail validation for required fields", () => {
    const newData = {
      name: "", // Empty name should fail validation
      bio: "New bio",
    }

    const result = updateUserProfile(sampleProfile, newData, {
      requiredFields: ["name", "bio"],
    })

    expect(result.success).toBe(false)
    expect(result.errors?.name).toBeDefined()
  })

  test("should apply custom validators", () => {
    const newData = {
      name: "J", // Too short
      birth_date: "2050-01-01", // Future date
    }

    const result = updateUserProfile(sampleProfile, newData, {
      validators: {
        name: profileValidators.name,
        birth_date: profileValidators.birth_date,
      },
    })

    expect(result.success).toBe(false)
    expect(result.errors?.name).toBeDefined()
    expect(result.errors?.birth_date).toBeDefined()
  })

  test("should exclude specified fields from update", () => {
    const newData = {
      name: "John Smith",
      profession: "Developer",
      education: "Master in CS",
    }

    const result = updateUserProfile(sampleProfile, newData, {
      excludedFields: ["profession"],
    })

    expect(result.success).toBe(true)
    expect(result.profile?.name).toBe("John Smith")
    expect(result.profile?.education).toBe("Master in CS")
    expect(result.profile?.profession).toBe("Engineer") // Should remain unchanged
  })

  test("should enforce maximum field length", () => {
    const longBio = "A".repeat(101) // 101 characters

    const newData = {
      bio: longBio,
    }

    const result = updateUserProfile(sampleProfile, newData, {
      maxFieldLength: 100,
    })

    expect(result.success).toBe(false)
    expect(result.errors?.bio).toBeDefined()
  })

  test("should handle invalid input types", () => {
    // @ts-ignore - Testing runtime type checking
    const result = updateUserProfile(sampleProfile, "not an object")

    expect(result.success).toBe(false)
    expect(result.message).toBeDefined()
  })
})

