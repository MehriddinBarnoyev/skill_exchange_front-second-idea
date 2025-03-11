"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, X } from "lucide-react"

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File) => Promise<void>
}

export function ImageUploadModal({ isOpen, onClose, onUpload }: ImageUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile)
      setSelectedFile(null)
      setPreviewUrl(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {previewUrl ? (
            <div className="relative">
              <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-auto rounded-lg" />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={() => {
                  setSelectedFile(null)
                  setPreviewUrl(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Click to select an image</p>
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <Button onClick={handleUpload} disabled={!selectedFile}>
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

