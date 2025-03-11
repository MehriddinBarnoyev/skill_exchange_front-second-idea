"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getUserProfile, type User, type Skill } from "@/lib/userProfile";
import {
  Loader2,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  GraduationCap,
  LinkIcon,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import { ConnectionRequestButton } from "@/components/ConnectionRequestButton";

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserProfile(id as string);

        setUser(userData);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Error fetching user data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-16 w-16 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
            <Button className="mt-4" onClick={() => router.push("/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Hero section with background */}
      <div className="relative mb-8 rounded-xl overflow-hidden">
        <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="absolute bottom-0 left-0 w-full transform translate-y-1/2 px-6">
          <div className="flex flex-col md:flex-row items-center">
            <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
              <AvatarImage
                src={`http://localhost:5000${user.profile_pic}`}
                alt={user.name}
              />
              <AvatarFallback className="text-2xl bg-gray-200">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Main profile content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
        {/* Left column - User info */}
        <div className="md:col-span-2">
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-bold">
                    {user.name}
                  </CardTitle>
                  {user.profession && (
                    <p className="text-gray-600 mt-1">{user.profession}</p>
                  )}
                </div>
                <ConnectionRequestButton
                  receiverId={user.id}
                  className="bg-blue-600 hover:bg-blue-700"
                  receiverName={""}
                />
              </div>
            </CardHeader>
            <CardContent>
              {user.bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">About</h3>
                  <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-700">
                  <Mail className="h-5 w-5 mr-3 text-blue-500" />
                  <span>{user.email}</span>
                </div>

                {user.location && (
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-5 w-5 mr-3 text-blue-500" />
                    <span>{user.location}</span>
                  </div>
                )}

                {user.profession && (
                  <div className="flex items-center text-gray-700">
                    <Briefcase className="h-5 w-5 mr-3 text-blue-500" />
                    <span>{user.profession}</span>
                  </div>
                )}

                {user.education && (
                  <div className="flex items-center text-gray-700">
                    <GraduationCap className="h-5 w-5 mr-3 text-blue-500" />
                    <span>{user.education}</span>
                  </div>
                )}

                {user.birth_date && (
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                    <span>
                      {new Date(user.birth_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Social links - these would be populated if the user had them */}
              <div className="mt-6 flex space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  asChild
                >
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-5 w-5 text-blue-400" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  asChild
                >
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-5 w-5 text-blue-700" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  asChild
                >
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <Github className="h-5 w-5" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  asChild
                >
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="h-5 w-5 text-gray-600" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Skills section */}
          <Card className="mt-6 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Skills & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.skills && user.skills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.skills.map((skill: Skill) => (
                    <Card
                      key={skill.id}
                      className="bg-white border shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg">{skill.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {skill.description}
                        </p>
                        {skill.level && (
                          <Badge
                            className={`mt-2 ${
                              skill.level === "beginner"
                                ? "bg-blue-100 text-blue-800"
                                : skill.level === "intermediate"
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {skill.level.charAt(0).toUpperCase() +
                              skill.level.slice(1)}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No skills listed yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Additional info */}
        <div>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Interests</CardTitle>
            </CardHeader>
            <CardContent>
              {user.interests ? (
                <div className="flex flex-wrap gap-2">
                  {user.interests.split(",").map((interest, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1"
                    >
                      {interest.trim()}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No interests listed yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Member Since
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                <span className="text-lg font-medium">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
