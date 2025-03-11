import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { UserCheck, MessageSquare, UserPlus } from "lucide-react"

export function RecentActivity() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
      <Card className="card-modern">
        <CardContent className="p-6">
          <div className="space-y-4">
            <ActivityItem
              icon={UserCheck}
              iconColor="text-blue-600"
              bgColor="bg-blue-100"
              content={
                <>
                  You connected with <span className="font-medium">Sarah Johnson</span>
                </>
              }
              time="2 hours ago"
            />
            <ActivityItem
              icon={MessageSquare}
              iconColor="text-purple-600"
              bgColor="bg-purple-100"
              content={
                <>
                  New message from <span className="font-medium">David Miller</span>
                </>
              }
              time="Yesterday"
            />
            <ActivityItem
              icon={UserPlus}
              iconColor="text-green-600"
              bgColor="bg-green-100"
              content={
                <>
                  Connection request from <span className="font-medium">Emily Chen</span>
                </>
              }
              time="2 days ago"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ActivityItemProps {
  icon: React.ElementType
  iconColor: string
  bgColor: string
  content: React.ReactNode
  time: string
}

function ActivityItem({ icon: Icon, iconColor, bgColor, content, time }: ActivityItemProps) {
  return (
    <div className="flex items-start">
      <div className={`rounded-full ${bgColor} p-2 mr-4`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-gray-800">{content}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  )
}

