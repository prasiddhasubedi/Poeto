"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Search as SearchIcon, User, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Avatar } from "@/components/shared/avatar"
import { PoemCard } from "@/components/poem/poem-card"
import { Button } from "@/components/ui/button"
import { PoemCardSkeleton } from "@/components/ui/skeleton"
import Link from "next/link"

type TabType = "users" | "poems"

interface SearchUser {
  id: string
  username: string
  display_name: string
  profile_picture_url: string | null
  bio: string | null
}

interface SearchPoem {
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
  likes_count: number
  comments_count: number
  is_liked: boolean
}

export default function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [activeTab, setActiveTab] = React.useState<TabType>("poems")
  const [users, setUsers] = React.useState<SearchUser[]>([])
  const [poems, setPoems] = React.useState<SearchPoem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null)
  const supabase = createClient()

  React.useEffect(() => {
    async function loadCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    loadCurrentUser()
  }, [supabase])

  React.useEffect(() => {
    async function searchData() {
      if (!query.trim()) {
        setUsers([])
        setPoems([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Search users by username or display name
        const { data: usersData } = await supabase
          .from("users")
          .select("id, username, display_name, profile_picture_url, bio")
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
          .limit(20)

        setUsers(usersData || [])

        // Search poems by content or title using full-text search
        const { data: poemsData } = await supabase
          .from("poems")
          .select(`
            id,
            title,
            content,
            created_at,
            edited_at,
            author:users!poems_author_id_fkey (
              id,
              username,
              display_name,
              profile_picture_url
            )
          `)
          .or(`content.ilike.%${query}%,title.ilike.%${query}%`)
          .order("created_at", { ascending: false })
          .limit(20)

        // Get likes and comments counts for poems
        if (poemsData) {
          const poemsWithCounts = await Promise.all(
            poemsData.map(async (poem) => {
              const { count: likesCount } = await supabase
                .from("likes")
                .select("*", { count: "exact", head: true })
                .eq("poem_id", poem.id)

              const { count: commentsCount } = await supabase
                .from("comments")
                .select("*", { count: "exact", head: true })
                .eq("poem_id", poem.id)

              let isLiked = false
              if (currentUserId) {
                const { data: likeData } = await supabase
                  .from("likes")
                  .select("id")
                  .eq("poem_id", poem.id)
                  .eq("user_id", currentUserId)
                  .single()
                isLiked = !!likeData
              }

              return {
                ...poem,
                author: Array.isArray(poem.author) ? poem.author[0] : poem.author,
                likes_count: likesCount || 0,
                comments_count: commentsCount || 0,
                is_liked: isLiked,
              }
            })
          )
          setPoems(poemsWithCounts)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }

    searchData()
  }, [query, currentUserId, supabase])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          {query && (
            <p className="text-muted-foreground">
              Results for &quot;{query}&quot;
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab("poems")}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === "poems"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            Poems ({poems.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === "users"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            Users ({users.length})
          </button>
        </div>

        {/* Content */}
        {!query.trim() ? (
          <div className="text-center py-12">
            <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Start searching</h3>
            <p className="text-muted-foreground">
              Enter a search term to find poems and users
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {activeTab === "poems" ? (
              <>
                <PoemCardSkeleton />
                <PoemCardSkeleton />
                <PoemCardSkeleton />
              </>
            ) : (
              <>
                <UserCardSkeleton />
                <UserCardSkeleton />
                <UserCardSkeleton />
              </>
            )}
          </div>
        ) : (
          <>
            {activeTab === "poems" && (
              <div className="space-y-4">
                {poems.length > 0 ? (
                  poems.map((poem) => (
                    <PoemCard
                      key={poem.id}
                      poem={poem}
                      currentUserId={currentUserId || undefined}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="No poems found"
                    description={`No poems match "${query}"`}
                  />
                )}
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-3">
                {users.length > 0 ? (
                  users.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))
                ) : (
                  <EmptyState
                    icon={User}
                    title="No users found"
                    description={`No users match "${query}"`}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function UserCard({ user }: { user: SearchUser }) {
  return (
    <Link href={`/${user.username}`}>
      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <Avatar
            src={user.profile_picture_url}
            alt={user.display_name}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg">{user.display_name}</h3>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            {user.bio && (
              <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function UserCardSkeleton() {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="text-center py-12">
      <Icon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
