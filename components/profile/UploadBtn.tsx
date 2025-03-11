"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Loader2 } from "lucide-react"
import { useFileUpload } from "@/hooks/fileUpload"

interface UploadButtonProps {
  onUpload: (file: File) => Promise<void>
}

export function UploadButton({ onUpload }: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { handleFileChange, triggerFileInput } = useFileUpload(async (file) => {
    setIsUploading(true)
    try {
      await onUpload(file)
    } finally {
      setIsUploading(false)
    }
  })

  return (
    <>
      <Button
        size="sm"
        className="absolute bottom-0 right-0 bg-white text-gray-800 hover:bg-gray-100"
        onClick={triggerFileInput}
        disabled={isUploading}
        aria-label="Update profile picture"
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </Button>
      <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" aria-hidden="true" />
    </>
  )
}

