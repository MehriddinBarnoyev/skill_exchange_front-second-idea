import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface NoSkillsFoundProps {
  searchTerm: string
}

export function NoSkillsFound({ searchTerm }: NoSkillsFoundProps) {
  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Skills Found</h2>
        <p className="text-gray-600">
          {searchTerm
            ? "No skills match your search criteria. Try adjusting your search terms."
            : "There are currently no skills available. Check back later or be the first to add a skill!"}
        </p>
      </CardContent>
    </Card>
  )
}

