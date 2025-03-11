"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import {
  getUserInfo,
  updateUserProfile as apiUpdateUserProfile,
  getUserSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  type User,
  type Skill,
} from "@/lib/api";
import { updateUserProfile, profileValidators } from "@/lib/updateUserProfile";
import {
  PlusCircle,
  Loader2,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Mail,
  UserIcon,
  Users,
} from "lucide-react";
import { ProfileCompletionModal } from "@/components/ProfileCompletionModal";
import { FriendsModal } from "@/components/FriendsModal";
import { ConnectionRequestButton } from "@/components/ConnectionRequestButton";

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState({
    name: "",
    description: "",
    level: "",
  });
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isSkillLoading, setIsSkillLoading] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view this profile");
          return;
        }

        const userData = await getUserInfo(token, id as string);
        setUser(userData);
        setEditedUser(userData);
        setShowCompleteProfile(!userData.is_profile_complete);

        const userSkills = await getUserSkills(token, id as string);
        console.log(userSkills);

        setSkills(userSkills.skills);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Error fetching user data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
    setValidationErrors({});
  };

  const handleSave = async () => {
    if (!editedUser || !user) return;

    // Validate the profile data before sending to the server
    const updateResult = updateUserProfile(user, editedUser, {
      requiredFields: ["name"],
      validators: {
        name: profileValidators.name,
        birth_date: profileValidators.birth_date,
        profilePicture: profileValidators.profilePicture,
        interests: profileValidators.interests,
      },
      maxFieldLength: 500, // Reasonable limit for text fields
    });

    if (!updateResult.success) {
      // Show validation errors
      if (updateResult.errors) {
        setValidationErrors(updateResult.errors);

        // Show toast with the first error
        const firstError = Object.values(updateResult.errors)[0];
        toast({
          title: "Validation Error",
          description: firstError,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Update Failed",
          description:
            updateResult.message ||
            "Failed to update your profile. Please check your inputs.",
          variant: "destructive",
        });
      }
      return;
    }

    // Clear validation errors
    setValidationErrors({});

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Use the validated and updated profile from our utility function
      const updatedUser = await apiUpdateUserProfile(
        token,
        updateResult.profile as User
      );
      setUser(updatedUser);
      setEditedUser(updatedUser);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
    setValidationErrors({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editedUser) return;

    const { name, value } = e.target;

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleAddSkill = async () => {
    setIsSkillLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const addedSkill = await addSkill(token, id as string, newSkill);
      setSkills([...skills, addedSkill]);
      setNewSkill({ name: "", description: "", level: "" });
      setIsAddingSkill(false);
      toast({
        title: "Skill Added",
        description: "Your new skill has been added successfully.",
      });
    } catch (error) {
      console.error("Failed to add skill:", error);
      toast({
        title: "Error",
        description: "Failed to add skill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSkillLoading(false);
    }
  };

  const handleUpdateSkill = async (skill: Skill) => {
    setIsSkillLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const updatedSkill = await updateSkill(token, skill.id, skill);
      setSkills(
        skills.map((s) => (s.id === updatedSkill.id ? updatedSkill : s))
      );
      setEditingSkill(null);
      toast({
        title: "Skill Updated",
        description: "Your skill has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update skill:", error);
      toast({
        title: "Error",
        description: "Failed to update skill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSkillLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    setIsSkillLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await deleteSkill(token, skillId);
      setSkills(skills.filter((s) => s.id !== skillId));
      toast({
        title: "Skill Deleted",
        description: "Your skill has been deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete skill:", error);
      toast({
        title: "Error",
        description: "Failed to delete skill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSkillLoading(false);
    }
  };

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

  const isOwnProfile = user.id === id;

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Modern Profile Overview Card */}
      <Card className="mb-8 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        <CardContent className="relative pt-0">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20 mb-4 md:mb-0">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src={user.profilePicture} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
              <h2 className="text-3xl mt-10 font-bold text-gray-800">
                {user.name}
              </h2>
              <p className="text-gray-600">{user.profession}</p>
            </div>
            <div className="flex justify-end space-x-2 w-full">
              {isOwnProfile ? (
                <>
                  <Button onClick={handleEdit} className="mt-4 md:mt-0">
                    Edit Profile
                  </Button>
                  <Button
                    onClick={() => setShowFriendsModal(true)}
                    variant="outline"
                    className="mt-4 md:mt-0"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Friends
                  </Button>
                  <Button variant="outline" className="mt-4 md:mt-0" onClick={() => router.push("/dashboard")}>
                    
                    Dashboard
                  </Button>
                </>
              ) : (
                <ConnectionRequestButton
                  receiverId={user.id}
                  className="mt-4 md:mt-0 bg-gray-700 hover:bg-gray-800"
                />
              )}
            </div>
          </div>
          {isEditing ? (
            <div className="space-y-4 mt-6">
              <div>
                <Input
                  name="name"
                  value={editedUser?.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className={validationErrors.name ? "border-red-500" : ""}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.name}
                  </p>
                )}
              </div>

              <div>
                <Input
                  name="email"
                  value={editedUser?.email}
                  onChange={handleChange}
                  placeholder="Email"
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <Textarea
                  name="bio"
                  value={editedUser?.bio}
                  onChange={handleChange}
                  placeholder="Short bio"
                  className={validationErrors.bio ? "border-red-500" : ""}
                />
                {validationErrors.bio && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.bio}
                  </p>
                )}
              </div>

              <div>
                <Input
                  name="location"
                  value={editedUser?.location}
                  onChange={handleChange}
                  placeholder="Location"
                  className={validationErrors.location ? "border-red-500" : ""}
                />
                {validationErrors.location && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.location}
                  </p>
                )}
              </div>

              <div>
                <Input
                  name="profession"
                  value={editedUser?.profession}
                  onChange={handleChange}
                  placeholder="Profession"
                  className={
                    validationErrors.profession ? "border-red-500" : ""
                  }
                />
                {validationErrors.profession && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.profession}
                  </p>
                )}
              </div>

              <div>
                <Input
                  name="education"
                  value={editedUser?.education}
                  onChange={handleChange}
                  placeholder="Education"
                  className={validationErrors.education ? "border-red-500" : ""}
                />
                {validationErrors.education && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.education}
                  </p>
                )}
              </div>

              <div>
                <Input
                  name="birth_date"
                  type="date"
                  value={editedUser?.birth_date}
                  onChange={handleChange}
                  placeholder="Birth Date"
                  className={
                    validationErrors.birth_date ? "border-red-500" : ""
                  }
                />
                {validationErrors.birth_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.birth_date}
                  </p>
                )}
              </div>

              <div>
                <Input
                  name="interests"
                  value={editedUser?.interests}
                  onChange={handleChange}
                  placeholder="Interests (comma-separated)"
                  className={validationErrors.interests ? "border-red-500" : ""}
                />
                {validationErrors.interests && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.interests}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-gray-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-gray-500" />
                <span>{user.location || "Not specified"}</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-gray-500" />
                <span>{user.profession || "Not specified"}</span>
              </div>
              <div className="flex items-center">
                <GraduationCap className="mr-2 h-5 w-5 text-gray-500" />
                <span>{user.education || "Not specified"}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-gray-500" />
                <span>
                  {user.birth_date
                    ? new Date(user.birth_date).toLocaleDateString()
                    : "Not specified"}
                </span>
              </div>
              <div className="flex items-center">
                <UserIcon className="mr-2 h-5 w-5 text-gray-500" />
                <span>{user.interests || "Not specified"}</span>
              </div>
            </div>
          )}
          {!isEditing && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">About Me</h3>
              <p className="text-gray-600">
                {user.bio || "No bio provided yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Card */}
      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          {isOwnProfile && (
            <Button onClick={() => setIsAddingSkill(true)} className="mb-4">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Skill
            </Button>
          )}
          {isAddingSkill && (
            <div className="mb-4 p-4 border rounded">
              <Input
                value={newSkill.name}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, name: e.target.value })
                }
                placeholder="Skill name"
                className="mb-2"
              />
              <Input
                value={newSkill.description}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, description: e.target.value })
                }
                placeholder="Description"
                className="mb-2"
              />
              <select
                value={newSkill.level}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, level: e.target.value })
                }
                className="w-full p-2 border rounded mb-2"
              >
                <option value="">Select level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <Button onClick={handleAddSkill} disabled={isSkillLoading}>
                {isSkillLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Add Skill"
                )}
              </Button>
            </div>
          )}
          {Array.isArray(skills) && skills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill) => (
                <Card key={skill.id} className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    {editingSkill?.id === skill.id ? (
                      <>
                        <Input
                          value={editingSkill.name}
                          onChange={(e) =>
                            setEditingSkill({
                              ...editingSkill,
                              name: e.target.value,
                            })
                          }
                          className="mb-2"
                        />
                        <Input
                          value={editingSkill.description}
                          onChange={(e) =>
                            setEditingSkill({
                              ...editingSkill,
                              description: e.target.value,
                            })
                          }
                          className="mb-2"
                        />
                        <select
                          value={editingSkill.level}
                          onChange={(e) =>
                            setEditingSkill({
                              ...editingSkill,
                              level: e.target.value as
                                | "beginner"
                                | "intermediate"
                                | "advanced",
                            })
                          }
                          className="w-full p-2 border rounded mb-2"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                        <Button
                          onClick={() => handleUpdateSkill(editingSkill)}
                          disabled={isSkillLoading}
                          className="mr-2"
                        >
                          {isSkillLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingSkill(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-lg mb-2">
                          {skill.name}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {skill.description}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          Level: {skill.level}
                        </p>
                        {isOwnProfile && (
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              onClick={() => setEditingSkill(skill)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteSkill(skill.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">No skills listed yet.</p>
                {isOwnProfile && (
                  <Button
                    onClick={() => setIsAddingSkill(true)}
                    className="mt-4"
                  >
                    Add Your First Skill
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      {!user.is_profile_complete && isOwnProfile && (
        <ProfileCompletionModal
          userId={user.id}
          onComplete={() => {
            setUser({ ...user, is_profile_complete: true });
            // Refresh user data after profile completion
            getUserInfo(localStorage.getItem("token") || "", user.id).then(
              setUser
            );
          }}
        />
      )}
      <FriendsModal
        isOpen={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        userId={user.id}
      />
    </div>
  );
}
