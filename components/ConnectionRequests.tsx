"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2, UserCheck, UserX } from "lucide-react"
import { ConnectionRequest, getConnectionRequests, respondToConnectionRequest } from "@/lib/requests"

export function ConnectionRequests() {
  const [requests, setRequests] = useState<ConnectionRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [respondingTo, setRespondingTo] = useState<number | null>(null)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token")
        const userId = localStorage.getItem("userId")
        if (!token || !userId) {
          toast({
            title: "Authentication Error",
            description: "Please log in to view connection requests.",
            variant: "destructive",
          })
          return
        }
        const fetchedRequests = await getConnectionRequests(token, userId)
        setRequests(fetchedRequests)
      } catch (error) {
        console.error("Failed to fetch connection requests:", error)
        toast({
          title: "Error",
          description: "Failed to fetch connection requests. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const handleRespond = async (requestId: number, action: "accepted" | "rejected") => {
    try {
      setRespondingTo(requestId)
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to respond to connection requests.",
          variant: "destructive",
        })
        return
      }
      await respondToConnectionRequest(token, requestId, action)
      setRequests(requests.filter((request) => request.id !== requestId))
      toast({
        title: "Response Sent",
        description: `Connection request ${action}.`,
      })
    } catch (error) {
      console.error("Failed to respond to connection request:", error)
      toast({
        title: "Error",
        description: "Failed to respond to connection request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRespondingTo(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">No pending connection requests.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">Connection Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.map((request) => (
          <div key={request.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <span className="text-gray-700">{request.sender_id}</span>
            <div className="space-x-2">
              <Button
                size="sm"
                onClick={() => handleRespond(request.id, "accepted")}
                disabled={respondingTo === request.id}
              >
                {respondingTo === request.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="h-4 w-4 mr-1" />
                )}
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRespond(request.id, "rejected")}
                disabled={respondingTo === request.id}
              >
                {respondingTo === request.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserX className="h-4 w-4 mr-1" />
                )}
                Reject
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

