"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { Loader2, X, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getFriends } from "@/lib/connection";

interface Connection {
  connected_user_profile_pic: string | undefined;
  id: string;
  connected_user_id: string;
  connected_user_name: string;
  connected_user_profession: string;
  connected_user_profile_picture: string;
}

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function FriendsModal({ isOpen, onClose, userId }: FriendsModalProps) {
  const [friends, setFriends] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view friends",
          variant: "destructive",
        });
        return;
      }

      const friendsList = await getFriends(userId);
      console.log(friendsList);
      
      setFriends(friendsList);
      
    } catch (error) {
      console.error("Failed to fetch friends:", error);
      toast({
        title: "Error",
        description: "Failed to load friends list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const numberOfFriends = friends.length;

  const handleSkillClick = (userId: string) => {
    router.push(`/user/${userId}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Friends {numberOfFriends}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No friends yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {friends.map((friend) => {
                const avatarUrl = `http://localhost:5010${friend.connected_user_profile_pic}`;
                return (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={avatarUrl}
                          alt={friend.connected_user_name}
                        />
                        <AvatarFallback>
                          {friend.connected_user_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">
                          {friend.connected_user_name}
                        </h4>
                        {friend.connected_user_profession && (
                          <p className="text-sm text-muted-foreground">
                            {friend.connected_user_profession}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/user/${friend.connected_user_id}`}>
                          View Profile
                        </Link>
                      </Button>
                      <Button size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}