"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, MapPin, Briefcase, GraduationCap, Calendar, UserIcon } from "lucide-react"
import type { User } from "@/lib/api"

interface ProfileDetailsProps {
  user: User
  editedUser: User | null
  isEditing: boolean
  validationErrors: { [key: string]: string }
  onSave: () => void
  onCancel: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function ProfileDetails({
  user,
  editedUser,
  isEditing,
  validationErrors,
  onSave,
  onCancel,
  onChange,
}: ProfileDetailsProps) {
  if (isEditing) {
    return (
      <div className="space-y-4 mt-6">
        {/* Editing form fields */}
        <div>
          <Input
            name="name"
            value={editedUser?.name}
            onChange={onChange}
            placeholder="Name"
            className={validationErrors.name ? "border-red-500" : ""}
          />
          {validationErrors.name && <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>}
        </div>
        {/* Add other input fields here */}
        <div className="flex space-x-2">
          <Button onClick={onSave}>Save</Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="flex items-center">
          <Mail className="mr-2 h-5 w-5 text-gray-500" />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="mr-2 h-5 w-5 text-gray-500" />
          <span>{user.location || "Not specified"}</span>
        </div>
        <div className="flex items-center">
          <Briefcase className="mr-2 h-5 w-5 text-gray-500" />
          <span>{user.profession || "Not specified"}</span>
        </div>
        <div className="flex items-center">
          <GraduationCap className="mr-2 h-5 w-5 text-gray-500" />
          <span>{user.education || "Not specified"}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-gray-500" />
          <span>{user.birth_date ? new Date(user.birth_date).toLocaleDateString() : "Not specified"}</span>
        </div>
        <div className="flex items-center">
          <UserIcon className="mr-2 h-5 w-5 text-gray-500" />
          <span>{user.interests || "Not specified"}</span>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">About Me</h3>
        <p className="text-gray-600">{user.bio || "No bio provided yet."}</p>
      </div>
    </>
  )
}

