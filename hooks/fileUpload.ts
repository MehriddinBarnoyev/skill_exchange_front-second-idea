"use client"

import type React from "react"

import { useRef } from "react"

export function useFileUpload(onUpload: (file: File) => Promise<void>) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  return { fileInputRef, triggerFileInput, handleFileChange }
}

