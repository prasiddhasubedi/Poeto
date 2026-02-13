"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Users, Grid3x3, UserPlus, UserMinus } from "lucide-react"
import { Avatar } from "@/components/shared/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PoemCard } from "@/components/poem/poem-card"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { User, Poem } from "@/types"
import Link from "next/link"

interface ProfileProps {
  user: User
  currentUserId?: string
  isOwnProfile: boolean
  isFollowing: boolean
  followersCount: number
  followingCount: number
  poems: any[]
}

export function ProfileView({
  user,
  currentUserId,
  isOwnProfile,
  isFollowing: initialIsFollowing,
  followersCount: initialFollowersCount,
  followingCount,
  poems,
}: ProfileProps) {
  const [isFollowing, setIsFollowing] = React.useState(initialIsFollowing)
  const [followersCount, setFollowersCount] = React.useState(initialFollowersCount)
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()

  const handleFollow = async () => {
    if (!currentUserId) {
      router.push("/login")
      return
    }

    setIsLoading(true)
    const newIsFollowing = !isFollowing
    const newFollowersCount = newIsFollowing ? followersCount + 1 : followersCount - 1

    setIsFollowing(newIsFollowing)
    setFollowersCount(newFollowersCount)

    try {
      if (newIsFollowing) {
        const { error } = await supabase.from("followers").insert({
          follower_id: currentUserId,
          following_id: user.id,
        })
        if (error) throw error
        addToast(`You are now following ${user.display_name}`, "success")
      } else {
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", user.id)
        if (error) throw error
        addToast(`Unfollowed ${user.display_name}`, "success")
      }
      router.refresh()
    } catch (error) {
      console.error("Error updating follow:", error)
      setIsFollowing(!newIsFollowing)
      setFollowersCount(followersCount)
      addToast("Failed to update follow status", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar
              src={user.profile_picture_url}
              alt={user.display_name}
              size="xl"
            />

            <div className="flex-1 space-y-2">
              <div>
                <h1 className="text-2xl font-bold">{user.display_name}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>

              {user.bio && (
                <p className="text-sm">{user.bio}</p>
              )}

              <div className="flex items-center space-x-4 text-sm">
                <Link href={`/${user.username}/followers`} className="hover:underline">
                  <span className="font-semibold">{followersCount}</span>{" "}
                  <span className="text-muted-foreground">Followers</span>
                </Link>
                <Link href={`/${user.username}/following`} className="hover:underline">
                  <span className="font-semibold">{followingCount}</span>{" "}
                  <span className="text-muted-foreground">Following</span>
                </Link>
              </div>
            </div>

            <div>
              {isOwnProfile ? (
                <Button asChild>
                  <Link href="/settings">Edit Profile</Link>
                </Button>
              ) : currentUserId ? (
                <Button
                  onClick={handleFollow}
                  disabled={isLoading}
                  variant={isFollowing ? "outline" : "default"}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/login">Follow</Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Grid3x3 className="h-5 w-5 mr-2" />
            Poems ({poems.length})
          </h2>
        </div>

        {poems.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">
                {isOwnProfile ? "You haven't posted any poems yet" : "No poems yet"}
              </p>
              {isOwnProfile && (
                <Button asChild className="mt-4">
                  <Link href="/create">Create your first poem</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {poems.map((poem) => (
              <PoemCard
                key={poem.id}
                poem={poem}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
