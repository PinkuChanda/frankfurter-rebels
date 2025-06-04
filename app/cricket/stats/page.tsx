"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Edit, Trash2, Plus, BarChart } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface TeamStat {
  id: number
  label: string
  value: string
  icon: string
  description: string
  is_active: boolean
  sort_order: number
}

export default function StatsManagement() {
  const [stats, setStats] = useState<TeamStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/team-stats")
      if (!response.ok) {
        throw new Error("Failed to fetch team stats")
      }
      const data = await response.json()
      setStats(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteStat = async (id: number) => {
    if (!confirm("Are you sure you want to delete this stat?")) return

    try {
      const response = await fetch(`/api/team-stats/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete stat")
      }

      await fetchStats()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <div className="container mx-auto py-10">Loading team stats...</div>

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Team Stats Management</h1>
        <div className="flex gap-2">
          <Link href="/cricket">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <Link href="/cricket/stats/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Stat
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
        {stats.map((stat) => (
          <Card key={stat.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span>{stat.label}</span>
                  <Badge variant={stat.is_active ? "default" : "secondary"}>
                    {stat.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Link href={`/cricket/stats/${stat.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => deleteStat(stat.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <strong>Value:</strong> {stat.value}
                </div>
                <div>
                  <strong>Icon:</strong> {stat.icon}
                </div>
                <div>
                  <strong>Sort Order:</strong> {stat.sort_order}
                </div>
              </div>
              {stat.description && (
                <div className="mt-4">
                  <strong>Description:</strong>
                  <p className="text-gray-600 mt-1">{stat.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {stats.length === 0 && (
          <Card>
            <CardContent className="text-center py-10">
              <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No team stats found.</p>
              <Link href="/cricket/stats/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Stat
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
