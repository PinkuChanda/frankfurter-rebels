"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PlayerForm({ params }: { params: { id: string } }) {
  const router = useRouter()
  const isNew = params.id === "new"
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [player, setPlayer] = useState({
    name: "",
    role: "",
    image_url: "",
    experience: "",
    description: "",
    is_owner: false,
    owner_title: "",
    is_captain: false,
    is_management: false,
    management_role: "",
    matches: 0,
    runs: 0,
    wickets: 0,
    season: "2025",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Fetch player data if editing
  useEffect(() => {
    if (isNew) return

    async function fetchPlayer() {
      try {
        const response = await fetch(`/api/players/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch player")
        }
        const data = await response.json()
        setPlayer(data)
        if (data.image_url) {
          setImagePreview(data.image_url)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayer()
  }, [isNew, params.id])

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file")
      return
    }

    setImageFile(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const updatedPlayer = { ...player }

      // Upload image if selected
      if (imageFile) {
        setUploading(true)
        setSuccess("Uploading image...")

        console.log("Starting image upload:", {
          fileName: imageFile.name,
          fileSize: imageFile.size,
          fileType: imageFile.type,
        })

        const formData = new FormData()
        formData.append("file", imageFile)
        formData.append("folder", "players")

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        console.log("Upload response status:", uploadResponse.status)

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error("Upload error response:", errorText)
          let errorMessage = "Failed to upload image"
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error || errorMessage
            console.error("Parsed error data:", errorData)
          } catch {
            errorMessage = errorText || errorMessage
          }
          throw new Error(errorMessage)
        }

        const uploadResult = await uploadResponse.json()
        console.log("Upload success:", uploadResult)

        updatedPlayer.image_url = uploadResult.url
        setSuccess("Image uploaded successfully!")
        setUploading(false)
      }

      // Create or update player
      setSuccess("Saving player data...")
      const url = isNew ? "/api/players" : `/api/players/${params.id}`
      const method = isNew ? "POST" : "PUT"

      console.log("Saving player data:", updatedPlayer)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPlayer),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Failed to save player"
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      console.log("Player saved successfully")
      setSuccess("Player saved successfully!")

      // Wait a moment to show success message, then redirect
      setTimeout(() => {
        router.push("/cricket/players")
        router.refresh()
      }, 1500)
    } catch (err: any) {
      console.error("Error saving player:", err)
      setError(err.message)
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  if (loading) return <div className="container mx-auto py-10">Loading player data...</div>

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Add New Player" : "Edit Player"}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={player.name}
                    onChange={(e) => setPlayer({ ...player, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={player.role}
                    onChange={(e) => setPlayer({ ...player, role: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    value={player.experience}
                    onChange={(e) => setPlayer({ ...player, experience: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="season">Season</Label>
                  <Select value={player.season} onValueChange={(value) => setPlayer({ ...player, season: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_owner"
                      checked={player.is_owner}
                      onCheckedChange={(checked) => {
                        setPlayer({
                          ...player,
                          is_owner: checked as boolean,
                          is_captain: checked ? false : player.is_captain, // Can't be both owner and captain
                        })
                      }}
                    />
                    <Label htmlFor="is_owner">Team Owner/Co-Owner</Label>
                  </div>

                  {player.is_owner && (
                    <div>
                      <Label htmlFor="owner_title">Owner Title</Label>
                      <Select
                        value={player.owner_title}
                        onValueChange={(value) => setPlayer({ ...player, owner_title: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select owner title" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Team Owner">Team Owner</SelectItem>
                          <SelectItem value="Team Co-Owner">Team Co-Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_captain"
                      checked={player.is_captain}
                      disabled={player.is_owner} // Can't be captain if owner
                      onCheckedChange={(checked) => setPlayer({ ...player, is_captain: checked as boolean })}
                    />
                    <Label htmlFor="is_captain">Team Captain</Label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_management"
                    checked={player.is_management}
                    onCheckedChange={(checked) => setPlayer({ ...player, is_management: checked as boolean })}
                  />
                  <Label htmlFor="is_management">Management/Support Staff</Label>
                </div>

                {player.is_management && (
                  <div>
                    <Label htmlFor="management_role">Management Role</Label>
                    <Select
                      value={player.management_role}
                      onValueChange={(value) => setPlayer({ ...player, management_role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select management role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Head Coach">Head Coach</SelectItem>
                        <SelectItem value="Assistant Coach">Assistant Coach</SelectItem>
                        <SelectItem value="Team Manager">Team Manager</SelectItem>
                        <SelectItem value="Team Physiotherapist">Team Physiotherapist</SelectItem>
                        <SelectItem value="Team Analyst">Team Analyst</SelectItem>
                        <SelectItem value="Equipment Manager">Equipment Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="matches">Matches</Label>
                  <Input
                    id="matches"
                    type="number"
                    value={player.matches}
                    onChange={(e) => setPlayer({ ...player, matches: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="runs">Runs</Label>
                  <Input
                    id="runs"
                    type="number"
                    value={player.runs}
                    onChange={(e) => setPlayer({ ...player, runs: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="wickets">Wickets</Label>
                  <Input
                    id="wickets"
                    type="number"
                    value={player.wickets}
                    onChange={(e) => setPlayer({ ...player, wickets: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="image">Player Image</Label>
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
                  <p className="text-sm text-gray-500 mt-1">Max file size: 5MB</p>
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm mb-1">Preview:</p>
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        width={100}
                        height={100}
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={player.description}
                onChange={(e) => setPlayer({ ...player, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push("/cricket/players")} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? (uploading ? "Uploading..." : "Saving...") : "Save Player"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
