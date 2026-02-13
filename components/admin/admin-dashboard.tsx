"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/shared/avatar"
import { Users, FileText, MessageSquare, Heart, Trash2, Shield } from "lucide-react"
import type { User } from "@/types"

interface AdminDashboardProps {
  stats: {
    users: number
    poems: number
    comments: number
    likes: number
  }
  recentPoems: any[]
  allUsers: User[]
  currentUserId: string
}

export function AdminDashboard({
  stats,
  recentPoems: initialPoems,
  allUsers: initialUsers,
  currentUserId,
}: AdminDashboardProps) {
  const [poems, setPoems] = React.useState(initialPoems)
  const [users, setUsers] = React.useState(initialUsers)
  const [deletingPoem, setDeletingPoem] = React.useState<string | null>(null)
  const [deletingUser, setDeletingUser] = React.useState<string | null>(null)
  const router = useRouter()

  const handleDeletePoem = async (poemId: string, poemTitle: string) => {
    if (!confirm(`Are you sure you want to delete this poem${poemTitle ? ` "${poemTitle}"` : ""}?`)) {
      return
    }

    setDeletingPoem(poemId)
    try {
      const response = await fetch(`/api/admin/poems/${poemId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete poem")
      }

      setPoems(poems.filter((p) => p.id !== poemId))
      router.refresh()
    } catch (error) {
      console.error("Error deleting poem:", error)
      alert("Failed to delete poem")
    } finally {
      setDeletingPoem(null)
    }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    if (userId === currentUserId) {
      alert("Cannot delete your own account")
      return
    }

    if (!confirm(`Are you sure you want to delete user @${username}? This will also delete all their poems, comments, and likes.`)) {
      return
    }

    setDeletingUser(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      setUsers(users.filter((u) => u.id !== userId))
      router.refresh()
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Failed to delete user")
    } finally {
      setDeletingUser(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your Poeto application</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Poems</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.poems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.comments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.likes}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Poems</CardTitle>
        </CardHeader>
        <CardContent>
          {poems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No poems yet</p>
          ) : (
            <div className="space-y-4">
              {poems.map((poem) => (
                <div
                  key={poem.id}
                  className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <Avatar
                        src={poem.author?.profile_picture_url}
                        alt={poem.author?.display_name}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {poem.author?.display_name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{poem.author?.username || "unknown"}
                        </p>
                      </div>
                    </div>
                    {poem.title && (
                      <h3 className="font-semibold mt-2">{poem.title}</h3>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {poem.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(poem.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePoem(poem.id, poem.title)}
                    disabled={deletingPoem === poem.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No users yet</p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <Avatar
                      src={user.profile_picture_url}
                      alt={user.display_name}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium truncate">{user.display_name}</p>
                        {user.is_admin && (
                          <Shield className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id, user.username)}
                    disabled={deletingUser === user.id || user.id === currentUserId}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
