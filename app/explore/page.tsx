import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"
import { PoemCard } from "@/components/poem/poem-card"
import { Avatar } from "@/components/shared/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"

async function getLatestPoems(supabase: any, currentUserId?: string) {
  const { data: poems } = await supabase
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
    .order("created_at", { ascending: false })
    .limit(20)

  if (!poems) return []

  const poemsWithCounts = await Promise.all(
    poems.map(async (poem: any) => {
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

  return poemsWithCounts
}

async function getTrendingPoems(supabase: any, currentUserId?: string) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: trendingLikes } = await supabase
    .from("likes")
    .select("poem_id")
    .gte("created_at", sevenDaysAgo.toISOString())

  if (!trendingLikes || trendingLikes.length === 0) {
    return getLatestPoems(supabase, currentUserId)
  }

  const poemIdCounts = trendingLikes.reduce((acc: any, like: any) => {
    acc[like.poem_id] = (acc[like.poem_id] || 0) + 1
    return acc
  }, {})

  const sortedPoemIds = Object.entries(poemIdCounts)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 20)
    .map(([id]) => id)

  const { data: poems } = await supabase
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
    .in("id", sortedPoemIds)

  if (!poems) return []

  const poemsWithCounts = await Promise.all(
    poems.map(async (poem: any) => {
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

  const sortedPoems = sortedPoemIds
    .map(id => poemsWithCounts.find(p => p.id === id))
    .filter(Boolean)

  return sortedPoems
}

async function getSuggestedUsers(supabase: any, currentUserId?: string) {
  let query = supabase
    .from("users")
    .select("id, username, display_name, profile_picture_url")
    .order("created_at", { ascending: false })
    .limit(5)

  if (currentUserId) {
    query = query.neq("id", currentUserId)
  }

  const { data: users } = await query

  if (!users || !currentUserId) return users || []

  const { data: following } = await supabase
    .from("followers")
    .select("following_id")
    .eq("follower_id", currentUserId)

  const followingIds = following?.map((f: any) => f.following_id) || []

  return users.filter((user: any) => !followingIds.includes(user.id))
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userData } = user
    ? await supabase
        .from("users")
        .select("id, username, display_name, profile_picture_url, is_admin")
        .eq("id", user.id)
        .single()
    : { data: null }

  const tab = params.tab || "latest"
  const poems = tab === "trending"
    ? await getTrendingPoems(supabase, user?.id)
    : await getLatestPoems(supabase, user?.id)

  const suggestedUsers = await getSuggestedUsers(supabase, user?.id)

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userData} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-4">Explore</h1>
              <div className="flex space-x-2 border-b">
                <Link
                  href="/explore?tab=latest"
                  className={`px-4 py-2 font-medium transition-colors ${
                    tab === "latest"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Latest
                </Link>
                <Link
                  href="/explore?tab=trending"
                  className={`px-4 py-2 font-medium transition-colors ${
                    tab === "trending"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Trending
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              {poems.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No poems found</p>
                </div>
              ) : (
                poems.map((poem: any) => (
                  <PoemCard
                    key={poem.id}
                    poem={poem}
                    currentUserId={user?.id}
                  />
                ))
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <Card>
              <CardHeader>
                <h2 className="font-semibold">Suggested Users</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestedUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No suggestions</p>
                ) : (
                  suggestedUsers.map((suggestedUser: any) => (
                    <Link
                      key={suggestedUser.id}
                      href={`/${suggestedUser.username}`}
                      className="flex items-center space-x-3 hover:bg-accent p-2 rounded-lg transition-colors"
                    >
                      <Avatar
                        src={suggestedUser.profile_picture_url}
                        alt={suggestedUser.display_name}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {suggestedUser.display_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{suggestedUser.username}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
