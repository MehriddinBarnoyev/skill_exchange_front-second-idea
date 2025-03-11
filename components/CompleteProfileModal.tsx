"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { completeUserProfile } from "@/lib/api"

interface CompleteProfileModalProps {
  userId: string
  onComplete: () => void
}

export function CompleteProfileModal({ userId, onComplete }: CompleteProfileModalProps) {
  const [formData, setFormData] = useState({
    location: "",
    profession: "",
    gender: "",
    education: "",
    birth_date: "",
    interests: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const updatedUser = await completeUserProfile(token, userId, formData)
      toast({
        title: "Profile Completed",
        description: "Your profile has been successfully updated.",
      })
      onComplete()
    } catch (error) {
      console.error("Failed to complete profile:", error)
      toast({
        title: "Error",
        description: "Failed to complete profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
            <Input
              name="profession"
              placeholder="Profession"
              value={formData.profession}
              onChange={handleChange}
              required
            />
            <Select onValueChange={(value) => handleSelectChange("gender", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              name="education"
              placeholder="Education"
              value={formData.education}
              onChange={handleChange}
              required
            />
            <Input
              name="birth_date"
              type="date"
              placeholder="Birth Date"
              value={formData.birth_date}
              onChange={handleChange}
              required
            />
            <Textarea
              name="interests"
              placeholder="Interests (comma-separated)"
              value={formData.interests}
              onChange={handleChange}
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

