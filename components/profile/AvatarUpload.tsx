"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ImageUploadModal } from "./ImageUploadModal"
import { Camera } from "lucide-react"

interface AvatarUploadProps {
  src: string | null
  alt: string
  onUpload: (file: File) => Promise<void>
}

export function AvatarUpload({ src, alt, onUpload }: AvatarUploadProps) {
  const [showUpdateButton, setShowUpdateButton] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowUpdateButton(true)}
      onMouseLeave={() => setShowUpdateButton(false)}
    >
      <Avatar className="w-24 h-24">
        <AvatarImage src={src || undefined} alt={alt} />
        <AvatarFallback>{alt[0]}</AvatarFallback>
      </Avatar>
      {showUpdateButton && (
        <Button
          size="sm"
          className="absolute bottom-0 right-0 bg-white text-gray-800 hover:bg-gray-100"
          onClick={() => setIsModalOpen(true)}
        >
          <Camera className="h-4 w-4" />
        </Button>
      )}
      <ImageUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUpload={onUpload} />
    </div>
  )
}

