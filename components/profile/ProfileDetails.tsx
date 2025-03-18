"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

interface ProfileDetailsProps {
  user: any
  editedUser: any
  isEditing: boolean
  validationErrors: { [key: string]: string }
  onSave: () => Promise<void>
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
  const [isSaving, setIsSaving] = useState(false)
  const [date, setDate] = useState<Date | undefined>(
    editedUser?.birth_date ? new Date(editedUser.birth_date) : undefined,
  )
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (editedUser?.birth_date && !date) {
      setDate(new Date(editedUser.birth_date))
    }
  }, [editedUser?.birth_date, date])

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) {
      const event = {
        target: {
          name: "birth_date",
          value: format(newDate, "yyyy-MM-dd"),
        },
      } as React.ChangeEvent<HTMLInputElement>
      onChange(event)
      setDirtyFields((prev) => new Set(prev).add("birth_date"))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e)
    setDirtyFields((prev) => new Set(prev).add(e.target.name))
  }

  const handleSelectChange = (value: string, fieldName: string) => {
    const event = {
      target: {
        name: fieldName,
        value,
      },
    } as React.ChangeEvent<HTMLInputElement>
    onChange(event)
    setDirtyFields((prev) => new Set(prev).add(fieldName))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave()
      setDirtyFields(new Set())
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Failed to save profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const isFieldDirty = (fieldName: string) => dirtyFields.has(fieldName)

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1 text-lg">{user.name || "Not provided"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-lg">{user.email || "Not provided"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="mt-1 text-lg">{user.location || "Not provided"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Profession</h3>
              <p className="mt-1 text-lg">{user.profession || "Not provided"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Birth Date</h3>
              <p className="mt-1 text-lg">
                {user.birth_date ? format(new Date(user.birth_date), "MMMM d, yyyy") : "Not provided"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Gender</h3>
              <p className="mt-1 text-lg">{user.gender || "Not provided"}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Bio</h3>
          <p className="mt-1 whitespace-pre-wrap">{user.bio || "No bio provided"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Interests</h3>
          <p className="mt-1">{user.interests || "No interests provided"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center">
              Name
              {isFieldDirty("name") && !validationErrors.name && (
                <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
              )}
            </Label>
            <Input
              id="name"
              name="name"
              value={editedUser?.name || ""}
              onChange={handleInputChange}
              className={cn(
                validationErrors.name ? "border-red-500" : "",
                isFieldDirty("name") && !validationErrors.name ? "border-green-500" : "",
              )}
            />
            {validationErrors.name && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" /> {validationErrors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center">
              Email
              {isFieldDirty("email") && !validationErrors.email && (
                <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
              )}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={editedUser?.email || ""}
              onChange={handleInputChange}
              className={cn(
                validationErrors.email ? "border-red-500" : "",
                isFieldDirty("email") && !validationErrors.email ? "border-green-500" : "",
              )}
              disabled
            />
            {validationErrors.email && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" /> {validationErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center">
              Location
              {isFieldDirty("location") && !validationErrors.location && (
                <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
              )}
            </Label>
            <Input
              id="location"
              name="location"
              value={editedUser?.location || ""}
              onChange={handleInputChange}
              className={cn(
                validationErrors.location ? "border-red-500" : "",
                isFieldDirty("location") && !validationErrors.location ? "border-green-500" : "",
              )}
            />
            {validationErrors.location && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" /> {validationErrors.location}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession" className="flex items-center">
              Profession
              {isFieldDirty("profession") && !validationErrors.profession && (
                <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
              )}
            </Label>
            <Input
              id="profession"
              name="profession"
              value={editedUser?.profession || ""}
              onChange={handleInputChange}
              className={cn(
                validationErrors.profession ? "border-red-500" : "",
                isFieldDirty("profession") && !validationErrors.profession ? "border-green-500" : "",
              )}
            />
            {validationErrors.profession && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" /> {validationErrors.profession}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date" className="flex items-center">
              Birth Date
              {isFieldDirty("birth_date") && !validationErrors.birth_date && (
                <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
              )}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                    validationErrors.birth_date ? "border-red-500" : "",
                    isFieldDirty("birth_date") && !validationErrors.birth_date ? "border-green-500" : "",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  initialFocus
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                />
              </PopoverContent>
            </Popover>
            {validationErrors.birth_date && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" /> {validationErrors.birth_date}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="flex items-center">
              Gender
              {isFieldDirty("gender") && !validationErrors.gender && (
                <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
              )}
            </Label>
            <Select value={editedUser?.gender || ""} onValueChange={(value) => handleSelectChange(value, "gender")}>
              <SelectTrigger
                className={cn(
                  validationErrors.gender ? "border-red-500" : "",
                  isFieldDirty("gender") && !validationErrors.gender ? "border-green-500" : "",
                )}
              >
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.gender && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" /> {validationErrors.gender}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="flex items-center">
          Bio
          {isFieldDirty("bio") && !validationErrors.bio && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
        </Label>
        <Textarea
          id="bio"
          name="bio"
          value={editedUser?.bio || ""}
          onChange={handleInputChange}
          className={cn(
            "min-h-[120px]",
            validationErrors.bio ? "border-red-500" : "",
            isFieldDirty("bio") && !validationErrors.bio ? "border-green-500" : "",
          )}
        />
        {validationErrors.bio && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="mr-1 h-4 w-4" /> {validationErrors.bio}
          </p>
        )}
        <p className="text-xs text-gray-500">{editedUser?.bio?.length || 0}/500 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="interests" className="flex items-center">
          Interests (comma separated)
          {isFieldDirty("interests") && !validationErrors.interests && (
            <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
          )}
        </Label>
        <Textarea
          id="interests"
          name="interests"
          value={editedUser?.interests || ""}
          onChange={handleInputChange}
          className={cn(
            validationErrors.interests ? "border-red-500" : "",
            isFieldDirty("interests") && !validationErrors.interests ? "border-green-500" : "",
          )}
          placeholder="e.g. reading, hiking, photography"
        />
        {validationErrors.interests && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="mr-1 h-4 w-4" /> {validationErrors.interests}
          </p>
        )}
      </div>

      <div className="flex space-x-2 pt-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

