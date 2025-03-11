"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/Navbar"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { connectionApi } from "@/lib/api"
import { Loader2, UserPlus, Search } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  profile_picture?: string
  bio?: string
}

export default function Users() {
  const { user, token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sendingRequestTo, setSendingRequestTo] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!user || !token) return

    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        // This would be replaced with your actual API endpoint to get all users
        // For now, we'll simulate it with a mock response
        const data = await fetch("/api/users").then((res) => res.json())
        // Filter out the current user
        const otherUsers = data.filter((u: User) => u.id !== user.id)
        setUsers(otherUsers)
        setFilteredUsers(otherUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load users",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [user, token, toast])

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const handleSendRequest = async (userId: string) => {
    if (!user || !token) return

    try {
      setSendingRequestTo(userId)
      await connectionApi.sendConnectionRequest(user.id, userId, token)
      toast({
        title: "Request Sent",
        description: "Connection request has been sent successfully",
      })
    } catch (error) {
      console.error("Error sending connection request:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send connection request",
        variant: "destructive",
      })
    } finally {
      setSendingRequestTo(null)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-2xl font-semibold text-gray-900">Find Users</h1>

              <div className="mt-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search users by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {isLoading ? (
                <div className="flex justify-center my-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <Card className="mt-6">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-gray-500">No users found matching your search criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 mb-4">
                            <AvatarImage src={user.profile_picture} alt={user.name} />
                            <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                          {user.bio && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{user.bio}</p>}
                          <div className="flex space-x-2 w-full">
                            <Button asChild variant="outline" className="flex-1">
                              <Link href={`/users/${user.id}`}>View Profile</Link>
                            </Button>
                            <Button
                              onClick={() => handleSendRequest(user.id)}
                              disabled={sendingRequestTo === user.id}
                              className="flex-1"
                            >
                              {sendingRequestTo === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <UserPlus className="h-4 w-4 mr-2" />
                              )}
                              Connect
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

