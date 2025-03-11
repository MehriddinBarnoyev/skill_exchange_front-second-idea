"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Loader2 } from "lucide-react"
import type { Skill } from "@/lib/api"

interface SkillCardProps {
  skill: Skill
  isOwnProfile: boolean
  onUpdate: (skill: Skill) => void
  onDelete: (skillId: string) => void
}

export function SkillCard({ skill, isOwnProfile, onUpdate, onDelete }: SkillCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedSkill, setEditedSkill] = useState(skill)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    setIsLoading(true)
    await onUpdate(editedSkill)
    setIsEditing(false)
    setIsLoading(false)
  }

  const handleDelete = async () => {
    setIsLoading(true)
    await onDelete(skill.id)
    setIsLoading(false)
  }

  return (
    <Card key={skill.id} className="bg-white shadow-sm">
      <CardContent className="p-4">
        {isEditing ? (
          <EditSkillForm
            skill={editedSkill}
            setSkill={setEditedSkill}
            onSave={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={isLoading}
          />
        ) : (
          <SkillDisplay
            skill={skill}
            isOwnProfile={isOwnProfile}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  )
}

interface EditSkillFormProps {
  skill: Skill
  setSkill: React.Dispatch<React.SetStateAction<Skill>>
  onSave: () => void
  onCancel: () => void
  isLoading: boolean
}

function EditSkillForm({ skill, setSkill, onSave, onCancel, isLoading }: EditSkillFormProps) {
  return (
    <>
      <Input value={skill.name} onChange={(e) => setSkill({ ...skill, name: e.target.value })} className="mb-2" />
      <Input
        value={skill.description}
        onChange={(e) => setSkill({ ...skill, description: e.target.value })}
        className="mb-2"
      />
      <select
        value={skill.level}
        onChange={(e) => setSkill({ ...skill, level: e.target.value as "beginner" | "intermediate" | "advanced" })}
        className="w-full p-2 border rounded mb-2"
      >
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <Button onClick={onSave} disabled={isLoading} className="mr-2">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save"}
      </Button>
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </>
  )
}

interface SkillDisplayProps {
  skill: Skill
  isOwnProfile: boolean
  onEdit: () => void
  onDelete: () => void
  isLoading: boolean
}

function SkillDisplay({ skill, isOwnProfile, onEdit, onDelete, isLoading }: SkillDisplayProps) {
  return (
    <>
      <h3 className="font-semibold text-lg mb-2">{skill.name}</h3>
      <p className="text-gray-600 mb-2">{skill.description}</p>
      <p className="text-sm text-gray-500 mb-2">Level: {skill.level}</p>
      {isOwnProfile && (
        <div className="flex justify-end space-x-2">
          <Button size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </>
  )
}

