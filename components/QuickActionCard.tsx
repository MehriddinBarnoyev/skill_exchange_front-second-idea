import Link from "next/link"
import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface QuickActionCardProps {
  href: string
  icon: LucideIcon
  title: string
  description: string
  delay?: string
}

export function QuickActionCard({ href, icon: Icon, title, description, delay = "0s" }: QuickActionCardProps) {
  return (
    <Card className="card-interactive animate-fade-in" style={{ animationDelay: delay }}>
      <Link href={href} className="block p-6">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full gradient-primary p-4 mb-4">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </Link>
    </Card>
  )
}

