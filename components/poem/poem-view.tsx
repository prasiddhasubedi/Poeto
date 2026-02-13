"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Heart, MessageCircle, Edit, Trash2, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Avatar } from "@/components/shared/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { CommentComponent } from "@/components/poem/comment"
import { formatRelativeTime } from "@/lib/utils"
import type { Poem, Comment, User } from "@/types"

interface PoemWithDetails extends Poem {
  author: User
  likes_count: number
  comments_count: number
  is_liked: boolean
  comments?: Comment[]
}

export function PoemView({
  poem: initialPoem,
  currentUserId,
}: {
  poem: PoemWithDetails
  currentUserId?: string
}) {
  const [poem, setPoem] = React.useState(initialPoem)
  const [isLiked, setIsLiked] = React.useState(initialPoem.is_liked)
  const [likesCount, setLikesCount] = React.useState(initialPoem.likes_count)
  const [comments, setComments] = React.useState<Comment[]>(initialPoem.comments || [])
  const [commentText, setCommentText] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const router = useRouter()
  const supabase = createClient()
  const isOwner = currentUserId === poem.author_id

  const handleLike = async () => {
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
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUserId) {
      router.push("/login")
      return
    }

    if (!commentText.trim()) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          poem_id: poem.id,
          user_id: currentUserId,
          content: commentText.trim(),
        })
        .select(`
          id,
          poem_id,
          user_id,
          content,
          created_at,
          updated_at,
          user:users!comments_user_id_fkey (
            id,
            username,
            display_name,
            profile_picture_url
          )
        `)
        .single()

      if (error) throw error

      const newComment = {
        ...data,
        user: Array.isArray(data.user) ? data.user[0] : data.user,
      }

      setComments([newComment, ...comments])
      setCommentText("")
      router.refresh()
    } catch (error) {
      console.error("Error posting comment:", error)
      alert("Failed to post comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePoem = async () => {
    if (!confirm("Are you sure you want to delete this poem?")) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from("poems")
        .delete()
        .eq("id", poem.id)
        .eq("author_id", currentUserId!)

      if (error) throw error

      router.push("/home")
    } catch (error) {
      console.error("Error deleting poem:", error)
      alert("Failed to delete poem")
      setIsDeleting(false)
    }
  }

  const handleDeleteComment = () => {
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/home">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <Link
              href={`/${poem.author.username}`}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
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

            {isOwner && (
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/poem/${poem.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeletePoem}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {poem.title && (
            <h1 className="text-2xl font-bold">{poem.title}</h1>
          )}

          <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed">
            {poem.content}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
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

              <div className="flex items-center space-x-2 text-muted-foreground">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">{comments.length}</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {formatRelativeTime(poem.created_at)}
              {poem.edited_at && " (edited)"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Comments</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentUserId && (
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !commentText.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </form>
          )}

          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentComponent
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
