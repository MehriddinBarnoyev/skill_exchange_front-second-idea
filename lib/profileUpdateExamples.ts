import { updateUserProfile, type UserProfile, profileValidators } from "./updateUserProfile"

/**
 * Example usage of the updateUserProfile function
 */
export function profileUpdateExamples() {
  // Example 1: Basic profile update
  const currentProfile: UserProfile = {
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

  const newData = {
    name: "John Smith",
    bio: "Senior Software Engineer",
    email: "new-email@example.com", // This will be ignored
    location: "San Francisco",
  }

  const result1 = updateUserProfile(currentProfile, newData)
  console.log("Example 1 - Basic update:", result1)
  // Email remains unchanged, other fields are updated

  // Example 2: Using required fields
  const result2 = updateUserProfile(currentProfile, { name: "", bio: "New bio" }, { requiredFields: ["name", "bio"] })
  console.log("Example 2 - Required fields:", result2)
  // Will fail because name is empty

  // Example 3: Using custom validators
  const result3 = updateUserProfile(
    currentProfile,
    { name: "J", birth_date: "2050-01-01" },
    {
      validators: {
        name: profileValidators.name,
        birth_date: profileValidators.birth_date,
      },
    },
  )
  console.log("Example 3 - Custom validators:", result3)
  // Will fail validation for both fields

  // Example 4: Excluding fields
  const result4 = updateUserProfile(
    currentProfile,
    { name: "John Smith", profession: "Developer", education: "Master in CS" },
    { excludedFields: ["profession"] },
  )
  console.log("Example 4 - Excluded fields:", result4)
  // profession will not be updated, but education will

  // Example 5: Maximum field length
  const result5 = updateUserProfile(
    currentProfile,
    { bio: "A very long biography that exceeds the maximum length limit set in the options" },
    { maxFieldLength: 20 },
  )
  console.log("Example 5 - Max field length:", result5)
  // Will fail because bio is too long

  return {
    example1: result1,
    example2: result2,
    example3: result3,
    example4: result4,
    example5: result5,
  }
}

