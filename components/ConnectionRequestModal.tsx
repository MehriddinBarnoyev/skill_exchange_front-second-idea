"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { Loader2, UserCheck, UserX, X } from "lucide-react";
import { ConnectionRequest, getConnectionRequests, respondToConnectionRequest } from "@/lib/requests";

interface ConnectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectionRequestModal({ isOpen, onClose }: ConnectionRequestModalProps) {
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchConnectionRequests();
    }
  }, [isOpen]);

  const fetchConnectionRequests = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view connection requests",
          variant: "destructive",
        });
        return;
      }

      const connectionRequests = await getConnectionRequests(userId);
      console.log("Connection requests:", connectionRequests);
      
      setRequests(connectionRequests);
    } catch (error) {
      console.error("Failed to fetch connection requests:", error);
      toast({
        title: "Error",
        description: "Failed to load connection requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (requestId: string, action: "accepted" | "rejected") => {
    try {
      setRespondingTo(requestId);
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to respond to connection requests",
          variant: "destructive",
        });
        return;
      }

      await respondToConnectionRequest(token, requestId, action);
      setRequests((prevRequests) => prevRequests.filter((request) => request.id !== requestId));

      toast({
        title: action === "accepted" ? "Request Accepted" : "Request Rejected",
        description:
          action === "accepted" ? "You are now connected with this user" : "Connection request has been rejected",
      });
    } catch (error) {
      console.error(`Failed to ${action} connection request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} connection request`,
        variant: "destructive",
      });
    } finally {
      setRespondingTo(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Connection Requests</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No pending connection requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={`${request.sender_profile_pic}`} alt={request.sender_name} />
                      <AvatarFallback>{request.sender_name?.charAt(0) ?? 'N/A'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{request.sender_name}</h4>
                      <p className="text-sm text-muted-foreground">{request.sender_profession}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleRespond(request.id, "accepted")}
                      disabled={respondingTo === request.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {respondingTo === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserCheck className="h-4 w-4 mr-1" />
                      )}
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleRespond(request.id, "rejected")}
                      disabled={respondingTo === request.id}
                      variant="destructive"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
