"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { completeUserProfile } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

interface ProfileCompletionModalProps {
  userId: string
  onComplete: () => void
  onClose?: () => void
}

interface Question {
  id: string
  field: keyof FormData
  label: string
  type: "text" | "date" | "select" | "textarea"
  options?: { value: string; label: string }[]
  required?: boolean
}

interface FormData {
  location: string
  profession: string
  gender: string
  education: string
  birth_date: string
  interests: string
}

export function ProfileCompletionModal({ userId, onComplete, onClose }: ProfileCompletionModalProps) {
  const [formData, setFormData] = useState<FormData>({
    location: "",
    profession: "",
    gender: "",
    education: "",
    birth_date: "",
    interests: "",
  })
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Define questions in pairs
  const questions: Question[][] = [
    [
      {
        id: "location",
        field: "location",
        label: "Where are you located?",
        type: "text",
        required: true,
      },
      {
        id: "profession",
        field: "profession",
        label: "What is your profession?",
        type: "text",
        required: true,
      },
    ],
    [
      {
        id: "gender",
        field: "gender",
        label: "What is your gender?",
        type: "select",
        options: [
          { value: "Male", label: "Male" },
          { value: "Female", label: "Female" },
          { value: "Other", label: "Other" },
        ],
        required: true,
      },
      {
        id: "education",
        field: "education",
        label: "What is your highest education?",
        type: "text",
        required: true,
      },
    ],
    [
      {
        id: "birth_date",
        field: "birth_date",
        label: "When were you born?",
        type: "date",
        required: true,
      },
      {
        id: "interests",
        field: "interests",
        label: "What are your interests? (comma-separated)",
        type: "textarea",
        required: true,
      },
    ],
  ]

  const totalSteps = questions.length

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    // Validate current step
    const currentQuestions = questions[currentStep]
    const isValid = currentQuestions.every((q) => {
      if (q.required) {
        return formData[q.field].trim() !== ""
      }
      return true
    })

    if (!isValid) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      await completeUserProfile(token, userId, formData)
      toast({
        title: "Profile Completed",
        description: "Your profile has been successfully updated.",
      })
      onComplete()
    } catch (error) {
      console.error("Failed to complete profile:", error)
      toast({
        title: "Error",
        description: "Failed to complete profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case "text":
        return (
          <Input
            id={question.id}
            value={formData[question.field]}
            onChange={(e) => handleChange(question.field, e.target.value)}
            placeholder={question.label}
            required={question.required}
            className="border-[#00ffff] focus:border-[#ff00ff] bg-black/5 text-white"
          />
        )
      case "date":
        return (
          <Input
            id={question.id}
            type="date"
            value={formData[question.field]}
            onChange={(e) => handleChange(question.field, e.target.value)}
            required={question.required}
            className="border-[#00ffff] focus:border-[#ff00ff] bg-black/5 text-white"
          />
        )
      case "select":
        return (
          <Select value={formData[question.field]} onValueChange={(value) => handleChange(question.field, value)}>
            <SelectTrigger className="border-[#00ffff] focus:border-[#ff00ff] bg-black/5 text-white">
              <SelectValue placeholder={question.label} />
            </SelectTrigger>
            <SelectContent className="bg-black text-white border-[#00ffff]">
              {question.options?.map((option) => (
                <SelectItem key={option.value} value={option.value} className="hover:bg-[#00ffff]/20">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "textarea":
        return (
          <Textarea
            id={question.id}
            value={formData[question.field]}
            onChange={(e) => handleChange(question.field, e.target.value)}
            placeholder={question.label}
            required={question.required}
            className="border-[#00ffff] focus:border-[#ff00ff] bg-black/5 text-white"
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-auto bg-gray-900 rounded-lg shadow-lg border border-[#00ffff] p-6 overflow-hidden">
        {/* Neon glow effect */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#ff00ff] to-[#00ffff]"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Complete Your Profile</h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-[#ff00ff] transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-700 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#ff00ff] to-[#00ffff]"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            ></div>
          </div>

          <div className="text-sm text-white/70 mb-4">
            Step {currentStep + 1} of {totalSteps}
          </div>

          <div className="space-y-6">
            {questions[currentStep].map((question) => (
              <div key={question.id} className="space-y-2">
                <label htmlFor={question.id} className="block text-white font-medium">
                  {question.label}
                </label>
                {renderQuestion(question)}
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <Button
              onClick={handleBack}
              disabled={currentStep === 0 || isLoading}
              className="bg-transparent border border-[#00ffff] text-white hover:bg-[#00ffff]/20"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#ff00ff] to-[#00ffff] text-white hover:opacity-90"
            >
              {isLoading ? "Saving..." : currentStep === totalSteps - 1 ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

