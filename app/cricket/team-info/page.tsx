"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Edit, Trash2, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface TeamInfo {
  id: number
  home_ground: string
  founded_year: number
  training_schedule: string
  team_size: string
  additional_info: string
  created_at: string
  updated_at: string
}

export default function TeamInfoManagement() {
  const [teamInfo, setTeamInfo] = useState<TeamInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeamInfo()
  }, [])

  const fetchTeamInfo = async () => {
    try {
      const response = await fetch("/api/team-info")
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

  const deleteTeamInfo = async (id: number) => {
    if (!confirm("Are you sure you want to delete this team information?")) return

    try {
      const response = await fetch(`/api/team-info/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete team information")
      }

      await fetchTeamInfo()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <div className="container mx-auto py-10">Loading team information...</div>

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Team Information Management</h1>
        <div className="flex gap-2">
          <Link href="/cricket">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <Link href="/cricket/team-info/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Team Information
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {teamInfo.map((info) => (
          <Card key={info.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Team Information #{info.id}</span>
                <div className="flex gap-2">
                  <Link href={`/cricket/team-info/${info.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => deleteTeamInfo(info.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <strong>Home Ground:</strong> {info.home_ground}
                </div>
                <div>
                  <strong>Founded Year:</strong> {info.founded_year}
                </div>
                <div>
                  <strong>Training Schedule:</strong> {info.training_schedule}
                </div>
                <div>
                  <strong>Team Size:</strong> {info.team_size}
                </div>
              </div>
              {info.additional_info && (
                <div className="mt-4">
                  <strong>Additional Information:</strong>
                  <p className="text-gray-600 mt-1">{info.additional_info}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {teamInfo.length === 0 && (
          <Card>
            <CardContent className="text-center py-10">
              <p className="text-gray-500 mb-4">No team information found.</p>
              <Link href="/cricket/team-info/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Team Information
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
