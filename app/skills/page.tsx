"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAllSkillsWithUsers, type SkillWithUser } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Search, AlertCircle } from "lucide-react"
import { Code, Palette, BookOpen, Database, Globe, Cpu, Music, Camera, Briefcase } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Helper function to get an appropriate icon based on skill name
const getSkillIcon = (skillName: string) => {
  const name = skillName.toLowerCase()

  if (name.includes("program") || name.includes("code") || name.includes("develop")) {
    return <Code className="h-5 w-5" />
  } else if (name.includes("design") || name.includes("ui") || name.includes("ux")) {
    return <Palette className="h-5 w-5" />
  } else if (name.includes("data") || name.includes("sql") || name.includes("analytics")) {
    return <Database className="h-5 w-5" />
  } else if (name.includes("web") || name.includes("internet") || name.includes("network")) {
    return <Globe className="h-5 w-5" />
  } else if (name.includes("ai") || name.includes("machine") || name.includes("learning")) {
    return <Cpu className="h-5 w-5" />
  } else if (name.includes("music") || name.includes("audio") || name.includes("sound")) {
    return <Music className="h-5 w-5" />
  } else if (name.includes("photo") || name.includes("video") || name.includes("film")) {
    return <Camera className="h-5 w-5" />
  } else if (name.includes("business") || name.includes("manage") || name.includes("lead")) {
    return <Briefcase className="h-5 w-5" />
  } else {
    return <BookOpen className="h-5 w-5" />
  }
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillWithUser[]>([])
  const [filteredSkills, setFilteredSkills] = useState<SkillWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const token = localStorage.getItem("token")
        const userId = localStorage.getItem("userId")
        if (!token || !userId) {
          toast({
            title: "Authentication Error",
            description: "Please log in to view skills.",
            variant: "destructive",
          })
          router.push("/login")
          return
        }
        const fetchedSkills = await getAllSkillsWithUsers(token)
        // Filter out the current user's skills
        const filteredSkills = fetchedSkills.filter((skill) => skill.user_id !== userId)
        setSkills(filteredSkills)
        setFilteredSkills(filteredSkills)
      } catch (error) {
        console.error("Failed to fetch skills:", error)
        toast({
          title: "Error",
          description: "Failed to fetch skills. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSkills()
  }, [router])

  useEffect(() => {
    const filtered = skills.filter(
      (skill) =>
        skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.user_name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredSkills(filtered)
  }, [searchTerm, skills])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSkillClick = (userId: string) => {
    router.push(`/user/${userId}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-16 w-16 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Explore Skills</h1>
      <div className="mb-6 relative">
        <Input
          type="text"
          placeholder="Search skills, descriptions, or users..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full max-w-md border-gray-300 focus:border-gray-500 pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      {filteredSkills.length === 0 ? (
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Skills Found</h2>
            <p className="text-gray-600">
              {searchTerm
                ? "No skills match your search criteria. Try adjusting your search terms."
                : "There are currently no skills available. Check back later or be the first to add a skill!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <Card
              key={skill.id}
              className="bg-white border-0 shadow-lg hover:shadow-xl rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 overflow-hidden skill-card-animation"
              onClick={() => handleSkillClick(skill.user_id)}
            >
              <div className="relative">
                <div className="absolute top-0 right-0 p-3">
                  {skill.level && (
                    <Badge
                      variant="secondary"
                      className={`text-xs font-medium ${
                        skill.level === "beginner"
                          ? "bg-blue-100 text-blue-700"
                          : skill.level === "intermediate"
                            ? "bg-green-100 text-green-700"
                            : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {skill.level}
                    </Badge>
                  )}
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-2 text-white">
                    {getSkillIcon(skill.skill_name)}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800 skill-card-title">{skill.skill_name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 font-light skill-card-description">{skill.description}</p>

                {/* Skill level progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Proficiency</span>
                    <span>{skill.level || "Not specified"}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${
                        skill.level === "beginner"
                          ? "from-blue-300 to-blue-500 w-1/3"
                          : skill.level === "intermediate"
                            ? "from-green-300 to-green-500 w-2/3"
                            : "from-purple-300 to-purple-500 w-full"
                      }`}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(skill.user_name)}&background=random`}
                    />
                    <AvatarFallback>{skill.user_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-700 font-medium">{skill.user_name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

