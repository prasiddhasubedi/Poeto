import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"
import { ProfileView } from "@/components/profile/profile-view"

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: currentUserData } = currentUser
    ? await supabase
        .from("users")
        .select("id, username, display_name, profile_picture_url, is_admin")
        .eq("id", currentUser.id)
        .single()
    : { data: null }

  const { data: profileUser } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single()

  if (!profileUser) {
    notFound()
  }

  const isOwnProfile = currentUser?.id === profileUser.id

  let isFollowing = false
  if (currentUser && !isOwnProfile) {
    const { data: followData } = await supabase
      .from("followers")
      .select("id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", profileUser.id)
      .single()
    isFollowing = !!followData
  }

  const { count: followersCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profileUser.id)

  const { count: followingCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profileUser.id)

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
    .eq("author_id", profileUser.id)
    .order("created_at", { ascending: false })

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

      let isLiked = false
      if (currentUser) {
        const { data: likeData } = await supabase
          .from("likes")
          .select("id")
          .eq("poem_id", poem.id)
          .eq("user_id", currentUser.id)
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={currentUserData} />
      <main className="container mx-auto px-4 py-8">
        <ProfileView
          user={profileUser}
          currentUserId={currentUser?.id}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          followersCount={followersCount || 0}
          followingCount={followingCount || 0}
          poems={poemsWithCounts}
        />
      </main>
    </div>
  )
}
