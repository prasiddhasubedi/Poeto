"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCard } from "@/components/shared/user-card"
import { ArrowLeft } from "lucide-react"
import type { User } from "@/types"

interface FollowersViewProps {
  profileUser: {
    id: string
    username: string
    display_name: string
  }
  followers: any[]
  currentUserId?: string
  currentUserFollowing: string[]
}

export function FollowersView({
  profileUser,
  followers,
  currentUserId,
  currentUserFollowing,
}: FollowersViewProps) {
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
          <h1 className="text-2xl font-bold">Followers</h1>
          <p className="text-muted-foreground">@{profileUser.username}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {followers.length} {followers.length === 1 ? "Follower" : "Followers"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {followers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No followers yet
            </p>
          ) : (
            <div className="space-y-3">
              {followers.map((follower) => (
                <UserCard
                  key={follower.id}
                  user={follower}
                  currentUserId={currentUserId}
                  initialIsFollowing={currentUserFollowing.includes(follower.id)}
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
