"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import { Users } from "lucide-react";
import type { User } from "@/lib/api";
import { ConnectionRequestButton } from "../ConnectionRequestButton";

interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
  onEdit: () => void;
  onShowFriends: () => void;
  onImageUpload: (imagePath: string) => void;
}

export function ProfileHeader({
  user,
  isOwnProfile,
  onEdit,
  onShowFriends,
  onImageUpload,
}: ProfileHeaderProps) {
  return (
    <Card className="mb-8 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
      <CardContent className="relative pt-0">
        <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20 mb-4 md:mb-0">
          <div className="relative">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage
                src={`http://localhost:5000${user.profile_pic}`}
                alt={user.name}
              />
              <AvatarFallback className="text-2xl">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <div className="absolute bottom-0 right-0">
                <ProfileImageUpload
                  userId={user.id}
                  onImageUpload={onImageUpload}
                />
              </div>
            )}
          </div>
          <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
            <h2 className="text-3xl mt-4 font-bold text-gray-800">
              {user.name}
            </h2>
            <p className="text-gray-600">{user.profession}</p>
          </div>
          {isOwnProfile ? (
            <div className="flex space-x-2">
              <Button onClick={onEdit} className="mt-4 md:mt-0 md:ml-auto">
                Edit Profile
              </Button>
              <Button
                onClick={onShowFriends}
                variant="outline"
                className="mt-4 md:mt-0"
              >
                <Users className="h-4 w-4 mr-2" />
                Friends
              </Button>
            </div>
          ) : (
            <ConnectionRequestButton
              receiverId={user.id}
              className="mt-4 md:mt-0 md:ml-auto bg-gray-700 hover:bg-gray-800"
              receiverName={""}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
