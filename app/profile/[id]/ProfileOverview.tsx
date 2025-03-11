"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConnectionRequestButton } from "@/components/ConnectionRequestButton";
import {
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  GraduationCap,
  UserIcon,
  Users,
} from "lucide-react";
import type { User } from "@/lib/api";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";

interface ProfileOverviewProps {
  user: User;
  isOwnProfile: boolean;
  onEditProfile: () => void;
  onShowFriends: () => void;
}

const handleImageUpload = (imagePath: string) => {
  setUser((prevUser) => ({
    ...prevUser!,
    profilePicture: `http://localhost:5000${imagePath}`,
  }))
}

export function ProfileOverview({
  user,
  isOwnProfile,
  onEditProfile,
  onShowFriends,
}: ProfileOverviewProps) {
  return (
    <Card className="mb-8 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
      <CardContent className="relative pt-0">
        <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20 mb-4 md:mb-0">
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
            <AvatarImage src={user.profilePicture} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {isOwnProfile && (
                <div className="mt-2">
                  <ProfileImageUpload onImageUpload={handleImageUpload} />
                </div>
              )}
          <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
            <h2 className="text-3xl mt-4 font-bold text-gray-800">
              {user.name}
            </h2>
            <p className="text-gray-600">{user.profession}</p>
          </div>
          <div className="flex justify-end space-x-2 w-full">

          {isOwnProfile ? (
            <div className="flex space-x-2">
              <Button
                onClick={onEditProfile}
                className="mt-4 md:mt-0 md:ml-auto"
              >
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
        </div>
        <ProfileDetails user={user} />
      </CardContent>
    </Card>
  );
}

function ProfileDetails({ user }: { user: User }) {
  const details = [
    { icon: Mail, value: user.email },
    { icon: MapPin, value: user.location },
    { icon: Briefcase, value: user.profession },
    { icon: GraduationCap, value: user.education },
    {
      icon: Calendar,
      value: user.birth_date
        ? new Date(user.birth_date).toLocaleDateString()
        : undefined,
    },
    { icon: UserIcon, value: user.interests },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {details.map(
        (detail, index) =>
          detail.value && (
            <div key={index} className="flex items-center">
              <detail.icon className="mr-2 h-5 w-5 text-gray-500" />
              <span>{detail.value}</span>
            </div>
          )
      )}
      {user.bio && (
        <div className="md:col-span-2 mt-6">
          <h3 className="text-xl font-semibold mb-2">About Me</h3>
          <p className="text-gray-600">{user.bio}</p>
        </div>
      )}
    </div>
  );
}
function setUser(arg0: (prevUser: any) => any) {
  throw new Error("Function not implemented.");
}

