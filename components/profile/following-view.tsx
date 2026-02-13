"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCard } from "@/components/shared/user-card"
import { ArrowLeft } from "lucide-react"
import type { User } from "@/types"

interface FollowingViewProps {
  profileUser: {
    id: string
    username: string
    display_name: string
  }
  following: any[]
  currentUserId?: string
  currentUserFollowing: string[]
  isOwnProfile: boolean
}

export function FollowingView({
  profileUser,
  following,
  currentUserId,
  currentUserFollowing,
  isOwnProfile,
}: FollowingViewProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href={`/${profileUser.username}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Following</h1>
          <p className="text-muted-foreground">@{profileUser.username}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {following.length} Following
          </CardTitle>
        </CardHeader>
        <CardContent>
          {following.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {isOwnProfile ? "You're not following anyone yet" : "Not following anyone yet"}
            </p>
          ) : (
            <div className="space-y-3">
              {following.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  currentUserId={currentUserId}
                  initialIsFollowing={currentUserFollowing.includes(user.id)}
                  showFollowButton={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
