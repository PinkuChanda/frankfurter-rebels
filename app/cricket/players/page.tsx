"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AlertCircle, Edit, Trash2, Plus, Users, Crown, Flag } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

interface Player {
  id: number
  name: string
  role: string
  image_url: string
  experience: string
  description: string
  is_owner: boolean
  owner_title: string
  is_captain: boolean
  is_management: boolean
  management_role: string
  matches: number
  runs: number
  wickets: number
}

export default function PlayersManagement() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      const response = await fetch("/api/players")
      if (!response.ok) {
        throw new Error("Failed to fetch players")
      }
      const data = await response.json()
      setPlayers(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deletePlayer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this player?")) return

    try {
      const response = await fetch(`/api/players/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete player")
      }

      await fetchPlayers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <div className="container mx-auto py-10">Loading players...</div>

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Players Management</h1>
        <div className="flex gap-2">
          <Link href="/cricket">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <Link href="/cricket/players/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Player
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player) => (
          <Card key={player.id}>
            <CardHeader className="pb-2">
              <div className="relative h-48 w-full">
                <Image
                  src={player.image_url || "/placeholder.svg"}
                  alt={player.name}
                  fill
                  className="object-cover rounded-md"
                />
                {player.is_owner && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500">
                    <Crown className="w-3 h-3 mr-1" />
                    {player.owner_title}
                  </Badge>
                )}
                {player.is_captain && !player.is_owner && (
                  <Badge className="absolute top-2 right-2 bg-blue-500">
                    <Flag className="w-3 h-3 mr-1" />
                    Captain
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold">{player.name}</h3>
                <p className="text-sm text-gray-600">{player.role}</p>
                {player.is_management && <Badge variant="outline">{player.management_role}</Badge>}
                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                  <div>
                    <div className="font-semibold">{player.matches}</div>
                    <div className="text-gray-500">Matches</div>
                  </div>
                  <div>
                    <div className="font-semibold">{player.runs}</div>
                    <div className="text-gray-500">Runs</div>
                  </div>
                  <div>
                    <div className="font-semibold">{player.wickets}</div>
                    <div className="text-gray-500">Wickets</div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="flex gap-2">
                    <Link href={`/cricket/players/${player.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm" onClick={() => deletePlayer(player.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {players.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-10">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No players found.</p>
              <Link href="/cricket/players/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Player
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
