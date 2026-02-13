import { redirect } from "next/navigation"
import Link from "next/link"
import { PenLine } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"
import { PoemCard } from "@/components/poem/poem-card"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/login")
  }

  const { data: userData } = await supabase
    .from("users")
    .select("id, username, display_name, profile_picture_url, is_admin")
    .eq("id", user.id)
    .single()

  const { data: following } = await supabase
    .from("followers")
    .select("following_id")
    .eq("follower_id", user.id)

  const followingIds = following?.map(f => f.following_id) || []
  followingIds.push(user.id)

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
    .in("author_id", followingIds)
    .order("created_at", { ascending: false })
    .limit(50)

  const poemsWithCounts = await Promise.all(
    (poems || []).map(async (poem) => {
      const { count: likesCount } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("poem_id", poem.id)

      const { count: commentsCount } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("poem_id", poem.id)

      const { data: likeData } = await supabase
        .from("likes")
        .select("id")
        .eq("poem_id", poem.id)
        .eq("user_id", user.id)
        .single()

      return {
        ...poem,
        author: Array.isArray(poem.author) ? poem.author[0] : poem.author,
        likes_count: likesCount || 0,
        comments_count: commentsCount || 0,
        is_liked: !!likeData,
      }
    })
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userData} />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button asChild className="w-full" size="lg">
            <Link href="/create">
              <PenLine className="h-5 w-5 mr-2" />
              Share a poem
            </Link>
          </Button>
        </div>

        {poemsWithCounts.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="text-muted-foreground space-y-2">
              <p className="text-lg font-medium">Welcome to Poeto!</p>
              <p>Your feed is empty because you&apos;re not following anyone yet.</p>
              <p className="text-sm">Start by exploring poets and following them to see their poems here.</p>
            </div>
            <div className="pt-4">
              <Button variant="outline" asChild>
                <Link href="/explore">Explore Poets</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {poemsWithCounts.map((poem) => (
              <PoemCard
                key={poem.id}
                poem={poem}
                currentUserId={user.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
