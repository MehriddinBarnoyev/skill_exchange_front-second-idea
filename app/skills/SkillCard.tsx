"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Code,
  Palette,
  BookOpen,
  Database,
  Globe,
  Cpu,
  Music,
  Camera,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { SkillWithUser } from "@/lib/api";
import { API_URL } from "@/lib/messages";

interface SkillCardProps {
  skill: SkillWithUser;
}

export function SkillCard({ skill }: SkillCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/user/${skill.user_id}`);
  };

  return (
    <Card
      className="bg-white border-0 shadow-lg hover:shadow-xl rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 overflow-hidden skill-card-animation"
      onClick={handleClick}
    >
      <div className="relative">
        <div className="absolute top-0 right-0 p-3">
          {skill.level && (
            <Badge
              variant="secondary"
              className={`text-xs font-medium ${
                skill.level === "beginner"
                  ? "bg-blue-100 text-blue-700"
                  : skill.level === "intermediate"
                  ? "bg-green-100 text-green-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {skill.level}
            </Badge>
          )}
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-2 text-white">
            {getSkillIcon(skill.skill_name)}
          </div>
          <CardTitle className="text-xl font-bold text-gray-800 skill-card-title">
            {skill.skill_name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4 font-light skill-card-description">
          {skill.description}
        </p>

        <SkillProgressBar level={skill.level} />

        <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage
              src={
                skill.profile_pic
                  ? skill.profile_pic.startsWith("http")
                    ? skill.profile_pic
                    : `${API_URL}${skill.profile_pic}`
                  : undefined
              }
              alt={skill.user_name}
            />
            <AvatarFallback className="bg-gray-200 text-gray-600">
              {skill.user_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-700 font-medium">
            {skill.user_name}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function SkillProgressBar({ level }: { level?: string }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Proficiency</span>
        <span>{level || "Not specified"}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${
            level === "beginner"
              ? "from-blue-300 to-blue-500 w-1/3"
              : level === "intermediate"
              ? "from-green-300 to-green-500 w-2/3"
              : "from-purple-300 to-purple-500 w-full"
          }`}
        ></div>
      </div>
    </div>
  );
}

function getSkillIcon(skillName: string) {
  const name = skillName.toLowerCase();

  if (
    name.includes("program") ||
    name.includes("code") ||
    name.includes("develop")
  ) {
    return <Code className="h-5 w-5" />;
  } else if (
    name.includes("design") ||
    name.includes("ui") ||
    name.includes("ux")
  ) {
    return <Palette className="h-5 w-5" />;
  } else if (
    name.includes("data") ||
    name.includes("sql") ||
    name.includes("analytics")
  ) {
    return <Database className="h-5 w-5" />;
  } else if (
    name.includes("web") ||
    name.includes("internet") ||
    name.includes("network")
  ) {
    return <Globe className="h-5 w-5" />;
  } else if (
    name.includes("ai") ||
    name.includes("machine") ||
    name.includes("learning")
  ) {
    return <Cpu className="h-5 w-5" />;
  } else if (
    name.includes("music") ||
    name.includes("audio") ||
    name.includes("sound")
  ) {
    return <Music className="h-5 w-5" />;
  } else if (
    name.includes("photo") ||
    name.includes("video") ||
    name.includes("film")
  ) {
    return <Camera className="h-5 w-5" />;
  } else if (
    name.includes("business") ||
    name.includes("manage") ||
    name.includes("lead")
  ) {
    return <Briefcase className="h-5 w-5" />;
  } else {
    return <BookOpen className="h-5 w-5" />;
  }
}
