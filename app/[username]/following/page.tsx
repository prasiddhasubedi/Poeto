import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"
import { FollowingView } from "@/components/profile/following-view"

export default async function FollowingPage({
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
    .select("id, username, display_name")
    .eq("username", username)
    .single()

  if (!profileUser) {
    notFound()
  }

  const { data: followingData } = await supabase
    .from("followers")
    .select(`
      id,
      created_at,
      following:users!followers_following_id_fkey (
        id,
        username,
        display_name,
        profile_picture_url
      )
    `)
    .eq("follower_id", profileUser.id)
    .order("created_at", { ascending: false })

  const following = (followingData || []).map((f) => ({
    ...f.following,
    followed_at: f.created_at,
  }))

  let currentUserFollowing: string[] = []
  if (currentUser) {
    const { data: followingData } = await supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", currentUser.id)

    currentUserFollowing = (followingData || []).map((f) => f.following_id)
  }

  const isOwnProfile = currentUser?.id === profileUser.id

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={currentUserData} />
      <main className="container mx-auto px-4 py-8">
        <FollowingView
          profileUser={profileUser}
          following={following}
          currentUserId={currentUser?.id}
          currentUserFollowing={currentUserFollowing}
          isOwnProfile={isOwnProfile}
        />
      </main>
    </div>
  )
}
