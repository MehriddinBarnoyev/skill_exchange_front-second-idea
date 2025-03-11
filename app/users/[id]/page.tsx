"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { connectionApi } from "@/lib/api"
import { Loader2, UserPlus, Mail, MapPin, Briefcase, Calendar } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  profile_picture?: string
  bio?: string
  location?: string
  profession?: string
  joined_date?: string
}

export default function UserProfile() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!user || !token || !id) return

    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        const data = await connectionApi.getUserProfile(id as string, token)
        setProfile(data)
      } catch (error) {
        console.error("Error fetching user profile:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load user profile",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [id, user, token, toast])

  const handleSendRequest = async () => {
    if (!user || !token || !profile) return

    try {
      setIsSendingRequest(true)
      await connectionApi.sendConnectionRequest(user.id, profile.id, token)
      toast({
        title: "Request Sent",
        description: `Connection request has been sent to ${profile.name}`,
      })
    } catch (error) {
      console.error("Error sending connection request:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send connection request",
        variant: "destructive",
      })
    } finally {
      setIsSendingRequest(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex justify-center my-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : !profile ? (
              <Card className="mt-6">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-500">User not found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="py-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row">
                      <div className="flex flex-col items-center md:items-start md:mr-8">
                        <Avatar className="h-32 w-32 mb-4">
                          <AvatarImage src={profile.profile_picture} alt={profile.name} />
                          <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {user && user.id !== profile.id && (
                          <Button onClick={handleSendRequest} disabled={isSendingRequest} className="w-full">
                            {isSendingRequest ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <UserPlus className="h-4 w-4 mr-2" />
                            )}
                            Connect
                          </Button>
                        )}
                      </div>
                      <div className="mt-4 md:mt-0 flex-1">
                        <h2 className="text-2xl font-bold">{profile.name}</h2>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {profile.email}
                          </div>

                          {profile.location && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {profile.location}
                            </div>
                          )}

                          {profile.profession && (
                            <div className="flex items-center text-gray-600">
                              <Briefcase className="h-4 w-4 mr-2" />
                              {profile.profession}
                            </div>
                          )}

                          {profile.joined_date && (
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              Joined {new Date(profile.joined_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {profile.bio && (
                          <div className="mt-6">
                            <h3 className="text-lg font-medium mb-2">About</h3>
                            <p className="text-gray-600">{profile.bio}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

