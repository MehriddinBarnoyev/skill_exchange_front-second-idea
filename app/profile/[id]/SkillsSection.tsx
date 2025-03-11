"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { addSkill, updateSkill, deleteSkill, type Skill } from "@/lib/api"
import { PlusCircle, Loader2 } from "lucide-react"
import { SkillCard } from "./SkillCard"

interface SkillsSectionProps {
  skills: Skill[]
  isOwnProfile: boolean
  userId: string
}

export function SkillsSection({ skills, isOwnProfile, userId }: SkillsSectionProps) {
  const [userSkills, setUserSkills] = useState<Skill[]>(skills)
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [newSkill, setNewSkill] = useState({ name: "", description: "", level: "" })
  const [isSkillLoading, setIsSkillLoading] = useState(false)

  const handleAddSkill = async () => {
    setIsSkillLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const addedSkill = await addSkill(token, userId, newSkill)
      setUserSkills([...userSkills, addedSkill])
      setNewSkill({ name: "", description: "", level: "" })
      setIsAddingSkill(false)
      toast({
        title: "Skill Added",
        description: "Your new skill has been added successfully.",
      })
    } catch (error) {
      console.error("Failed to add skill:", error)
      toast({
        title: "Error",
        description: "Failed to add skill. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSkillLoading(false)
    }
  }

  const handleUpdateSkill = async (updatedSkill: Skill) => {
    setIsSkillLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const result = await updateSkill(token, updatedSkill.id, updatedSkill)
      setUserSkills(userSkills.map((s) => (s.id === result.id ? result : s)))
      toast({
        title: "Skill Updated",
        description: "Your skill has been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to update skill:", error)
      toast({
        title: "Error",
        description: "Failed to update skill. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSkillLoading(false)
    }
  }

  const handleDeleteSkill = async (skillId: string) => {
    setIsSkillLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      await deleteSkill(token, skillId)
      setUserSkills(userSkills.filter((s) => s.id !== skillId))
      toast({
        title: "Skill Deleted",
        description: "Your skill has been deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete skill:", error)
      toast({
        title: "Error",
        description: "Failed to delete skill. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSkillLoading(false)
    }
  }

  return (
    <Card className="mb-8 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Skills</CardTitle>
      </CardHeader>
      <CardContent>
        {isOwnProfile && (
          <Button onClick={() => setIsAddingSkill(true)} className="mb-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Skill
          </Button>
        )}
        {isAddingSkill && (
          <AddSkillForm
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            onAddSkill={handleAddSkill}
            isLoading={isSkillLoading}
          />
        )}
        {userSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                isOwnProfile={isOwnProfile}
                onUpdate={handleUpdateSkill}
                onDelete={handleDeleteSkill}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">No skills listed yet.</p>
              {isOwnProfile && (
                <Button onClick={() => setIsAddingSkill(true)} className="mt-4">
                  Add Your First Skill
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

interface AddSkillFormProps {
  newSkill: { name: string; description: string; level: string }
  setNewSkill: React.Dispatch<React.SetStateAction<{ name: string; description: string; level: string }>>
  onAddSkill: () => void
  isLoading: boolean
}

function AddSkillForm({ newSkill, setNewSkill, onAddSkill, isLoading }: AddSkillFormProps) {
  return (
    <div className="mb-4 p-4 border rounded">
      <Input
        value={newSkill.name}
        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
        placeholder="Skill name"
        className="mb-2"
      />
      <Input
        value={newSkill.description}
        onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
        placeholder="Description"
        className="mb-2"
      />
      <select
        value={newSkill.level}
        onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
        className="w-full p-2 border rounded mb-2"
      >
        <option value="">Select level</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <Button onClick={onAddSkill} disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add Skill"}
      </Button>
    </div>
  )
}

