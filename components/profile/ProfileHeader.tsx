"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Users, MessageSquare } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ConnectionRequestButton } from "../ConnectionRequestButton"
import { useRouter } from "next/navigation"
import { uploadProfileImage } from "@/lib/api"

const API_URL = "http://localhost:5010"

interface ProfileHeaderProps {
  user: any
  isOwnProfile: boolean
  onEdit: () => void
  onShowFriends: () => void
  onImageUpload?: (imagePath: string) => void
}

export function ProfileHeader({ user, isOwnProfile, onEdit, onShowFriends, onImageUpload }: ProfileHeaderProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [profilePic, setProfilePic] = useState(user.profile_pic)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    // Create a temporary URL for the file and update the UI immediately
    const tempImageUrl = URL.createObjectURL(file)
    setProfilePic(tempImageUrl)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const imagePath = await uploadProfileImage(token, file, user.id)

      // After successful upload, update with the server URL
      const fullPath = `${imagePath}`

      // Revoke the temporary URL to free up memory
      URL.revokeObjectURL(tempImageUrl)

      // Update with the permanent URL from server
      setProfilePic(fullPath)

      if (onImageUpload) {
        onImageUpload(fullPath)
      }

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully",
      })
    } catch (error: any) {
      console.error("Avatar upload error:", error)
      // If upload fails, revert to the original profile pic
      setProfilePic(user.profile_pic)

      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      })

      // Revoke the temporary URL
      URL.revokeObjectURL(tempImageUrl)
    }
  }

  console.log(profilePic);
  

  return (
    <Card className="mb-8 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
      <CardContent className="relative pt-0">
        <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20 mb-4 md:mb-0">
          <div className="relative" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <Avatar className="w-32 h-32 border-4 border-white">
              <AvatarImage src={profilePic} alt={user.name} />
              <AvatarFallback className="bg-gray-200 text-gray-600 text-2xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>

            {isOwnProfile && isHovering && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-white" />
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
            <h2 className="text-3xl mt-4 font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-600">{user.profession}</p>
          </div>

          <div className="flex space-x-2 mt-4 md:mt-0 md:ml-auto">
            {isOwnProfile ? (
              <>
                <Button onClick={onEdit}>Edit Profile</Button>
                <Button onClick={onShowFriends} variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Friends
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center"
                  onClick={() => router.push(`/chat?userId=${user.id}`)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </>
            ) : (
              <div className="flex space-x-2">
                <ConnectionRequestButton
                  receiverId={user.id}
                  className="bg-gray-700 hover:bg-gray-800"
                  receiverName={user.name}
                />
                <Button
                  variant="outline"
                  className="flex items-center"
                  onClick={() => router.push(`/chat?userId=${user.id}`)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

