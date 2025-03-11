"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { connectionApi } from "@/lib/api"
import { Bell } from "lucide-react"
import { ConnectionRequestModal } from "./ConnectionRequestModal"

export function ConnectionRequestBadge() {
  const [requestCount, setRequestCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchRequestCount = async () => {
      try {
        const token = localStorage.getItem("token")
        const userId = localStorage.getItem("userId")

        if (!token || !userId) {
          setIsLoading(false)
          return
        }

        const requests = await connectionApi.getConnectionRequests(userId, token)
        setRequestCount(requests.length)
      } catch (error) {
        console.error("Failed to fetch connection request count:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequestCount()

    // Set up polling to check for new requests every minute
    const interval = setInterval(fetchRequestCount, 60000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading || requestCount === 0) {
    return (
      <>
        <button onClick={() => setIsModalOpen(true)} className="relative">
          <Bell className="h-5 w-5" />
        </button>
        <ConnectionRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    )
  }

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="relative">
        <Bell className="h-5 w-5" />
        <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[1.25rem] text-xs flex items-center justify-center">
          {requestCount}
        </Badge>
      </button>
      <ConnectionRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

