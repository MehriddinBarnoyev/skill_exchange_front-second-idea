"use client"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface UserProfileAvatarProps {
  imageUrl?: string
  userName: string
  onUpload?: (imageUrl: string) => void
}

export function UserProfileAvatar({
  imageUrl = "/placeholder.svg?height=100&width=100",
  userName,
  onUpload,
}: UserProfileAvatarProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [currentImage, setCurrentImage] = useState(imageUrl)

  const handleMouseEnter = () => setIsHovering(true)
  const handleMouseLeave = () => setIsHovering(false)

  const handleUploadClick = async () => {
    try {
      // Open file picker
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "image/*"

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        // Validate file
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

        // Create preview URL
        const previewUrl = URL.createObjectURL(file)
        setCurrentImage(previewUrl)

        if (onUpload) {
          onUpload(previewUrl)
        }

        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        })
      }

      input.click()
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "Failed to update profile picture",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Avatar className="h-24 w-24 border-2 border-gray-200">
        <AvatarImage src={currentImage} alt={userName} />
        <AvatarFallback>{userName[0].toUpperCase()} sds</AvatarFallback>
      </Avatar>

      {isHovering && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer transition-all duration-200"
          onClick={handleUploadClick}
        >
          <Upload className="h-6 w-6 text-white" />
        </div>
      )}
    </div>
  )
}

