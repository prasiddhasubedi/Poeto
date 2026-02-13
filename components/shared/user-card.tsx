"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar } from "@/components/shared/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, UserMinus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@/types"

interface UserCardProps {
  user: User
  currentUserId?: string
  initialIsFollowing?: boolean
  showFollowButton?: boolean
}

export function UserCard({
  user,
  currentUserId,
  initialIsFollowing = false,
  showFollowButton = true,
}: UserCardProps) {
  const [isFollowing, setIsFollowing] = React.useState(initialIsFollowing)
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!currentUserId) {
      router.push("/login")
      return
    }

    setIsLoading(true)
    const newIsFollowing = !isFollowing

    try {
      if (newIsFollowing) {
        const { error } = await supabase.from("followers").insert({
          follower_id: currentUserId,
          following_id: user.id,
        })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", user.id)
        if (error) throw error
      }
      setIsFollowing(newIsFollowing)
      router.refresh()
    } catch (error) {
      console.error("Error updating follow:", error)
      alert("Failed to update follow status")
    } finally {
      setIsLoading(false)
    }
  }

  const isOwnProfile = currentUserId === user.id

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <Link href={`/${user.username}`} className="flex items-center space-x-3 flex-1">
            <Avatar
              src={user.profile_picture_url}
              alt={user.display_name}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user.display_name}</p>
              <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
            </div>
          </Link>

          {showFollowButton && !isOwnProfile && currentUserId && (
            <Button
              onClick={handleFollow}
              disabled={isLoading}
              variant={isFollowing ? "outline" : "default"}
              size="sm"
            >
              {isFollowing ? (
                <>
                  <UserMinus className="h-4 w-4 mr-1" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
