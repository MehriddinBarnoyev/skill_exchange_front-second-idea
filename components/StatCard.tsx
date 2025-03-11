import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  title: string
  value: number | string
  delay?: string
}

export function StatCard({ icon: Icon, title, value, delay = "0s" }: StatCardProps) {
  return (
    <Card className="card-modern animate-scale-in" style={{ animationDelay: delay }}>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="rounded-full gradient-primary p-3 mr-4">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

