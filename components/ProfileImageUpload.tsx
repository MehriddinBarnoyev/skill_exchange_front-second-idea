"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"

interface ProfileImageUploadProps {
  userId: string
  onImageUpload: (imagePath: string) => void
}

export function ProfileImageUpload({ userId, onImageUpload }: ProfileImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    const formData = new FormData()
    formData.append("profile_image", selectedFile)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5010/api/users/upload-profile-image/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      onImageUpload(data.imagePath)
      toast({
        title: "Image uploaded",
        description: "Your profile image has been updated successfully.",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
      />
      <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </>
        )}
      </Button>
    </div>
  )
}

