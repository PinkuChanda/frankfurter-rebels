"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TeamInfoForm({ params }: { params: { id: string } }) {
  const router = useRouter()
  const isNew = params.id === "new"
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [teamInfo, setTeamInfo] = useState({
    home_ground: "",
    founded_year: new Date().getFullYear(),
    training_schedule: "",
    team_size: "",
    additional_info: "",
  })

  // Fetch team info data if editing
  useEffect(() => {
    if (isNew) return

    async function fetchTeamInfo() {
      try {
        const response = await fetch(`/api/team-info/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch team information")
        }
        const data = await response.json()
        setTeamInfo(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamInfo()
  }, [isNew, params.id])

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = isNew ? "/api/team-info" : `/api/team-info/${params.id}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamInfo),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Failed to save team information"
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Redirect back to team info management
      router.push("/cricket/team-info")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) return <div className="container mx-auto py-10">Loading team information...</div>

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Add New Team Information" : "Edit Team Information"}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="home_ground">Home Ground</Label>
                <Input
                  id="home_ground"
                  value={teamInfo.home_ground}
                  onChange={(e) => setTeamInfo({ ...teamInfo, home_ground: e.target.value })}
                  required
                  placeholder="e.g., Frankfurt Cricket Ground, Hessen, Germany"
                />
              </div>

              <div>
                <Label htmlFor="founded_year">Founded Year</Label>
                <Input
                  id="founded_year"
                  type="number"
                  value={teamInfo.founded_year}
                  onChange={(e) => setTeamInfo({ ...teamInfo, founded_year: Number.parseInt(e.target.value) || 0 })}
                  required
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <Label htmlFor="training_schedule">Training Schedule</Label>
                <Input
                  id="training_schedule"
                  value={teamInfo.training_schedule}
                  onChange={(e) => setTeamInfo({ ...teamInfo, training_schedule: e.target.value })}
                  required
                  placeholder="e.g., Tuesday & Thursday evenings, Weekend matches"
                />
              </div>

              <div>
                <Label htmlFor="team_size">Team Size</Label>
                <Input
                  id="team_size"
                  value={teamInfo.team_size}
                  onChange={(e) => setTeamInfo({ ...teamInfo, team_size: e.target.value })}
                  required
                  placeholder="e.g., 15 active players + support staff"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="additional_info">Additional Information</Label>
              <Textarea
                id="additional_info"
                value={teamInfo.additional_info}
                onChange={(e) => setTeamInfo({ ...teamInfo, additional_info: e.target.value })}
                rows={4}
                placeholder="Any additional information about the team..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/cricket/team-info")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Team Information"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
