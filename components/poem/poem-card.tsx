"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, MessageCircle, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/shared/avatar"
import { formatRelativeTime } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface PoemCardProps {
  poem: {
    id: string
    title: string | null
    content: string
    created_at: string
    edited_at: string | null
    author: {
      id: string
      username: string
      display_name: string
      profile_picture_url: string | null
    }
    likes_count?: number
    comments_count?: number
    is_liked?: boolean
  }
  currentUserId?: string
  showActions?: boolean
}

export function PoemCard({ poem, currentUserId, showActions = true }: PoemCardProps) {
  const [isLiked, setIsLiked] = React.useState(poem.is_liked || false)
  const [likesCount, setLikesCount] = React.useState(poem.likes_count || 0)
  const [showMenu, setShowMenu] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()

  const isOwner = currentUserId === poem.author.id

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUserId) {
      router.push("/login")
      return
    }

    const newIsLiked = !isLiked
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1

    setIsLiked(newIsLiked)
    setLikesCount(newLikesCount)

    try {
      if (newIsLiked) {
        await supabase.from("likes").insert({
          user_id: currentUserId,
          poem_id: poem.id,
        })
      } else {
        await supabase
          .from("likes")
          .delete()
          .eq("user_id", currentUserId)
          .eq("poem_id", poem.id)
      }
    } catch (error) {
      console.error("Error updating like:", error)
      setIsLiked(!newIsLiked)
      setLikesCount(likesCount)
      addToast("Failed to update like", "error")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this poem?")) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from("poems")
        .delete()
        .eq("id", poem.id)
        .eq("author_id", currentUserId!)

      if (error) throw error

      addToast("Poem deleted successfully", "success")
      router.refresh()
    } catch (error) {
      console.error("Error deleting poem:", error)
      addToast("Failed to delete poem", "error")
      setIsDeleting(false)
    }
  }

  const truncateContent = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text
    const truncated = text.slice(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "..."
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Link
            href={`/${poem.author.username}`}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar
              src={poem.author.profile_picture_url}
              alt={poem.author.display_name}
              size="md"
            />
            <div>
              <p className="font-semibold">{poem.author.display_name}</p>
              <p className="text-sm text-muted-foreground">@{poem.author.username}</p>
            </div>
          </Link>

          {isOwner && showActions && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-40 bg-background border rounded-lg shadow-lg z-50">
                    <Link
                      href={`/poem/${poem.id}/edit`}
                      className="flex items-center px-4 py-2 text-sm hover:bg-accent"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(false)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(false)
                        handleDelete()
                      }}
                      disabled={isDeleting}
                      className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <Link href={`/poem/${poem.id}`}>
        <CardContent className="space-y-3">
          {poem.title && (
            <h3 className="text-xl font-semibold">{poem.title}</h3>
          )}
          
          <div className="whitespace-pre-wrap font-serif text-base leading-relaxed">
            {truncateContent(poem.content)}
          </div>

          {poem.edited_at && (
            <p className="text-xs text-muted-foreground italic">
              (edited)
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className="flex items-center space-x-2 hover:text-red-500 transition-colors"
              >
                <Heart
                  className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                />
                <span className="text-sm">{likesCount}</span>
              </button>

              <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">{poem.comments_count || 0}</span>
              </button>
            </div>

            <span className="text-sm text-muted-foreground">
              {formatRelativeTime(poem.created_at)}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
