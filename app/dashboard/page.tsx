"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { connectionApi, type ConnectionRequest } from "@/lib/api"
import { Loader2, Users, UserPlus, UserCheck, Activity, MessageSquare, Briefcase } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { user, token } = useAuth()
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([])
  const [connectionCount, setConnectionCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || !token) return

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [requests, connections] = await Promise.all([
          connectionApi.getConnectionRequests(user.id, token),
          connectionApi.getUserConnections(user.id, token),
        ])

        setPendingRequests(requests)
        setConnectionCount(connections.length)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, token])

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold gradient-text mb-6">Dashboard</h1>

            {isLoading ? (
              <div className="flex justify-center my-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <>
                {/* Stats Overview */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Overview</h2>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="card-modern animate-scale-in">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="rounded-full gradient-primary p-3 mr-4">
                            <UserPlus className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                            <p className="text-2xl font-bold">{pendingRequests.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="card-modern animate-scale-in" style={{ animationDelay: "0.1s" }}>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="rounded-full gradient-primary p-3 mr-4">
                            <UserCheck className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Connections</p>
                            <p className="text-2xl font-bold">{connectionCount}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="card-modern animate-scale-in" style={{ animationDelay: "0.2s" }}>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="rounded-full gradient-primary p-3 mr-4">
                            <MessageSquare className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Messages</p>
                            <p className="text-2xl font-bold">0</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="card-modern animate-scale-in" style={{ animationDelay: "0.3s" }}>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="rounded-full gradient-primary p-3 mr-4">
                            <Activity className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Activity</p>
                            <p className="text-2xl font-bold">12</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <Card className="card-interactive animate-fade-in">
                      <Link href="/connections/requests" className="block p-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="rounded-full gradient-primary p-4 mb-4">
                            <UserPlus className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-semibold mb-2">Connection Requests</h3>
                          <p className="text-sm text-gray-600">View and respond to your pending requests</p>
                        </div>
                      </Link>
                    </Card>

                    <Card className="card-interactive animate-fade-in" style={{ animationDelay: "0.1s" }}>
                      <Link href="/connections" className="block p-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="rounded-full gradient-primary p-4 mb-4">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-semibold mb-2">Manage Connections</h3>
                          <p className="text-sm text-gray-600">View and manage your network connections</p>
                        </div>
                      </Link>
                    </Card>

                    <Card className="card-interactive animate-fade-in" style={{ animationDelay: "0.2s" }}>
                      <Link href="/skills" className="block p-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="rounded-full gradient-primary p-4 mb-4">
                            <Briefcase className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-semibold mb-2">Explore Skills</h3>
                          <p className="text-sm text-gray-600">Discover skills and connect with professionals</p>
                        </div>
                      </Link>
                    </Card>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
                  <Card className="card-modern">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="rounded-full bg-blue-100 p-2 mr-4">
                            <UserCheck className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-800">
                              You connected with <span className="font-medium">Sarah Johnson</span>
                            </p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="rounded-full bg-purple-100 p-2 mr-4">
                            <MessageSquare className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-800">
                              New message from <span className="font-medium">David Miller</span>
                            </p>
                            <p className="text-xs text-gray-500">Yesterday</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="rounded-full bg-green-100 p-2 mr-4">
                            <UserPlus className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-800">
                              Connection request from <span className="font-medium">Emily Chen</span>
                            </p>
                            <p className="text-xs text-gray-500">2 days ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

