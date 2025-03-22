"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import {
  getUserInfo,
  getUserSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  type User,
  type Skill,
} from "@/lib/api"
import {  profileValidators, updateUserProfile } from "@/lib/updateUserProfile"
import { Loader2 } from "lucide-react"
import { ProfileCompletionModal } from "@/components/ProfileCompletionModal"
import { FriendsModal } from "@/components/FriendsModal"
import { ProfileHeader } from "@/components/profile/ProfileHeader"
import { ProfileDetails } from "@/components/profile/ProfileDetails"
import { SkillsSection } from "@/components/profile/SkillsSection"

export default function UserProfile() {
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [skills, setSkills] = useState<Skill[]>([])
  const [showCompleteProfile, setShowCompleteProfile] = useState(false)
  const [showFriendsModal, setShowFriendsModal] = useState(false)
  const { id } = useParams()
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("You must be logged in to view this profile")
          return
        }

        const userData = await getUserInfo(token, id as string)

        console.log(userData);
        
        setUser(userData)
        setEditedUser(userData)
        setShowCompleteProfile(!userData.is_profile_complete)

        const userSkills = await getUserSkills(token, id as string)
        setSkills(userSkills)
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Error fetching user data. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [id])

  const handleEdit = () => {
    setIsEditing(true)
    setValidationErrors({})
  }

  const handleSave = async () => {
    if (!editedUser || !user) return

    const updateResult = updateUserProfile(user, editedUser, {
      requiredFields: ["name"],
      validators: {
        name: profileValidators.name,
        birth_date: profileValidators.birth_date,
        profilePicture: profileValidators.profilePicture,
        interests: profileValidators.interests,
      },
      maxFieldLength: 500,
    })

    console.log(updateResult);
    
    if (!updateResult.success) {
      if (updateResult.errors) {
        setValidationErrors(updateResult.errors)
        const firstError = Object.values(updateResult.errors)[0]
        toast({
          title: "Validation Error",
          description: firstError,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Update Failed",
          description: updateResult.message || "Failed to update your profile. Please check your inputs.",
          variant: "destructive",
        })
      }
      return
    }

    setValidationErrors({})

    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const updatedUser = await updateUserProfile(user, updateResult.profile as User)
      setUser(updatedUser)
      console.log(`updatedUser: ${updatedUser}`);
      
      setEditedUser(updatedUser)
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setEditedUser(user)
    setIsEditing(false)
    setValidationErrors({})
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedUser) return

    const { name, value } = e.target

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    setEditedUser({ ...editedUser, [name]: value })
  }

  const handleImageUpload = (profilePicture: string) => {
    setUser((prevUser) => ({
      ...prevUser,
      profilePicture,
    }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-16 w-16 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
            <Button className="mt-4" onClick={() => router.push("/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) return null

  const isOwnProfile = user.id === id

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        onEdit={handleEdit}
        onShowFriends={() => setShowFriendsModal(true)}
        onImageUpload={handleImageUpload}
      />

      <Card className="mb-8 shadow-sm">
        <CardContent>
          <ProfileDetails
            user={user}
            editedUser={editedUser}
            isEditing={isEditing}
            validationErrors={validationErrors}
            onSave={handleSave}
            onCancel={handleCancel}
            onChange={handleChange}
          />
        </CardContent>
      </Card>

      <SkillsSection
        skills={skills}
        isOwnProfile={isOwnProfile}
        onAddSkill={addSkill}
        onUpdateSkill={updateSkill}
        onDeleteSkill={deleteSkill}
      />

      {!user.is_profile_complete && isOwnProfile && (
        <ProfileCompletionModal
          userId={user.id}
          onComplete={() => {
            setUser({ ...user, is_profile_complete: true })
            getUserInfo(localStorage.getItem("token") || "", user.id).then(setUser)
          }}
        />
      )}
      <FriendsModal isOpen={showFriendsModal} onClose={() => setShowFriendsModal(false)} userId={user.id} />
    </div>
  )
}

