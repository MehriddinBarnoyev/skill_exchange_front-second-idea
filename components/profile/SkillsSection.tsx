"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { PlusCircle, Loader2, Pencil, Trash2 } from "lucide-react"
import { addSkill, type Skill } from "@/lib/api"

interface SkillsSectionProps {
  skills: Skill[]
  isOwnProfile: boolean
  onAddSkill: (
    token: string,
    userId: string,
    skill: { name: string; description: string; level: string },
  ) => Promise<Skill>
  onUpdateSkill: (token: string, skillId: string, skill: Partial<Skill>) => Promise<Skill>
  onDeleteSkill: (token: string, skillId: string) => Promise<void>
}

export function SkillsSection({ skills, isOwnProfile, onAddSkill, onUpdateSkill, onDeleteSkill }: SkillsSectionProps) {
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [newSkill, setNewSkill] = useState({ name: "", description: "", level: "" })
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [isSkillLoading, setIsSkillLoading] = useState(false)

  const handleAddSkill = async () => {
    setIsSkillLoading(true)
    try {
      const token = localStorage.getItem("token")
      const userId = localStorage.getItem("userId")
      if (!token || !userId) return

      await addSkill(token, userId, newSkill)
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

  const handleUpdateSkill = async (skill: Skill) => {
    setIsSkillLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      await onUpdateSkill(token, skill.id, skill)
      setEditingSkill(null)
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

      await onDeleteSkill(token, skillId)
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
              <option value="expert">Expert</option>
            </select>
            <Button onClick={handleAddSkill} disabled={isSkillLoading}>
              {isSkillLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add Skill"}
            </Button>
          </div>
        )}
        {Array.isArray(skills) && skills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <Card key={skill.id} className="bg-white shadow-sm">
                <CardContent className="p-4">
                  {editingSkill?.id === skill.id ? (
                    <>
                      <Input
                        value={editingSkill.name}
                        onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                        className="mb-2"
                      />
                      <Input
                        value={editingSkill.description}
                        onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                        className="mb-2"
                      />
                      <select
                        value={editingSkill.level}
                        onChange={(e) =>
                          setEditingSkill({
                            ...editingSkill,
                            level: e.target.value as "beginner" | "intermediate" | "advanced",
                          })
                        }
                        className="w-full p-2 border rounded mb-2"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                      <Button
                        onClick={() => handleUpdateSkill(editingSkill)}
                        disabled={isSkillLoading}
                        className="mr-2"
                      >
                        {isSkillLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save"}
                      </Button>
                      <Button variant="outline" onClick={() => setEditingSkill(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold text-lg mb-2">{skill.name}</h3>
                      <p className="text-gray-600 mb-2">{skill.description}</p>
                      <p className="text-sm text-gray-500 mb-2">Level: {skill.level}</p>
                      {isOwnProfile && (
                        <div className="flex justify-end space-x-2">
                          <Button size="sm" onClick={() => setEditingSkill(skill)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteSkill(skill.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
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

