"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { getAllSkillsWithUsers, type SkillWithUser } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { Search } from "lucide-react"
import { PageHeader } from "@/components/PageHeader"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { NoSkillsFound } from "./NoSKillsFound"
import { SkillCard } from "./SkillCard"


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

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <PageHeader title="Explore Skills" />
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
        <NoSkillsFound searchTerm={searchTerm} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  )
}

