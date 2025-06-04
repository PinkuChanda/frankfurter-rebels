"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StatsForm({ params }: { params: { id: string } }) {
  const router = useRouter()
  const isNew = params.id === "new"
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [teamStat, setTeamStat] = useState({
    label: "",
    value: "",
    icon: "",
    description: "",
    is_active: true,
    sort_order: 0,
  })

  const icons = [
    { value: "Trophy", label: "Trophy" },
    { value: "Star", label: "Star" },
    { value: "Users", label: "Users" },
    { value: "Shield", label: "Shield" },
    { value: "Target", label: "Target" },
    { value: "Award", label: "Award" },
  ]

  // Fetch team stat data if editing
  useEffect(() => {
    if (isNew) return

    async function fetchTeamStat() {
      try {
        const response = await fetch(`/api/team-stats/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch team stat")
        }
        const data = await response.json()
        setTeamStat(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamStat()
  }, [isNew, params.id])

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Create or update team stat
      const url = isNew ? "/api/team-stats" : `/api/team-stats/${params.id}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamStat),
      })

      if (!response.ok) {
        throw new Error("Failed to save team stat")
      }

      // Redirect back to admin dashboard
      router.push("/cricket")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) return <div className="container mx-auto py-10">Loading team stat data...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto shadow-sm">
          <CardHeader>
            <CardTitle>{isNew ? "Add New Team Stat" : "Edit Team Stat"}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={teamStat.label}
                  onChange={(e) => setTeamStat({ ...teamStat, label: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={teamStat.value}
                  onChange={(e) => setTeamStat({ ...teamStat, value: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select value={teamStat.icon} onValueChange={(value) => setTeamStat({ ...teamStat, icon: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {icons.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={teamStat.description}
                  onChange={(e) => setTeamStat({ ...teamStat, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={teamStat.sort_order}
                    onChange={(e) => setTeamStat({ ...teamStat, sort_order: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox
                    id="is_active"
                    checked={teamStat.is_active}
                    onCheckedChange={(checked) => setTeamStat({ ...teamStat, is_active: checked as boolean })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.push("/cricket")} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700"
                >
                  {saving ? "Saving..." : "Save Team Stat"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
