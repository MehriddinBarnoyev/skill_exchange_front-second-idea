"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { connectionApi, type ConnectionRequest } from "@/lib/api"
import { Users, UserPlus, UserCheck, Activity, MessageSquare, Briefcase } from "lucide-react"
import { PageHeader } from "@/components/PageHeader"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { StatCard } from "@/components/StatCard"
import { QuickActionCard } from "@/components/QuickActionCard"
import { RecentActivity } from "./RecentActivity"

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

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <PageHeader title="Dashboard" />

            <StatsOverview pendingRequests={pendingRequests.length} connectionCount={connectionCount} />

            <QuickActions />

            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  )
}

function StatsOverview({ pendingRequests, connectionCount }: { pendingRequests: number; connectionCount: number }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Overview</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={UserPlus} title="Pending Requests" value={pendingRequests} />
        <StatCard icon={UserCheck} title="Connections" value={connectionCount} delay="0.1s" />
        <StatCard icon={MessageSquare} title="Messages" value={0} delay="0.2s" />
        <StatCard icon={Activity} title="Activity" value={12} delay="0.3s" />
      </div>
    </div>
  )
}

function QuickActions() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <QuickActionCard
          href="/connections/requests"
          icon={UserPlus}
          title="Connection Requests"
          description="View and respond to your pending requests"
        />
        <QuickActionCard
          href="/connections"
          icon={Users}
          title="Manage Connections"
          description="View and manage your network connections"
          delay="0.1s"
        />
        <QuickActionCard
          href="/skills"
          icon={Briefcase}
          title="Explore Skills"
          description="Discover skills and connect with professionals"
          delay="0.2s"
        />
      </div>
    </div>
  )
}

