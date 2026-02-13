"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"
import { Avatar } from "@/components/shared/avatar"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Comment } from "@/types"

interface CommentProps {
  comment: Comment
  currentUserId?: string
  onDelete?: () => void
}

export function CommentComponent({ comment, currentUserId, onDelete }: CommentProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)
  const supabase = createClient()
  const isOwner = currentUserId === comment.user_id

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", comment.id)
        .eq("user_id", currentUserId!)

      if (error) throw error

      onDelete?.()
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert("Failed to delete comment")
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex space-x-3">
      <Avatar
        src={comment.user?.profile_picture_url}
        alt={comment.user?.display_name || "User"}
        size="sm"
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm">
              {comment.user?.display_name}
            </span>
            <span className="text-xs text-muted-foreground">
              @{comment.user?.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm">{comment.content}</p>
      </div>
    </div>
  )
}
