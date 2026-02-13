import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"
import { PoemView } from "@/components/poem/poem-view"

export default async function PoemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userData } = user
    ? await supabase
        .from("users")
        .select("id, username, display_name, profile_picture_url")
        .eq("id", user.id)
        .single()
    : { data: null }

  const { data: poem } = await supabase
    .from("poems")
    .select(`
      id,
      author_id,
      title,
      content,
      created_at,
      updated_at,
      edited_at,
      author:users!poems_author_id_fkey (
        id,
        email,
        username,
        display_name,
        bio,
        profile_picture_url,
        is_admin,
        created_at,
        updated_at
      )
    `)
    .eq("id", id)
    .single()

  if (!poem) {
    notFound()
  }

  const { count: likesCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("poem_id", poem.id)

  const { data: comments } = await supabase
    .from("comments")
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
    .eq("poem_id", poem.id)
    .order("created_at", { ascending: false })

  let isLiked = false
  if (user) {
    const { data: likeData } = await supabase
      .from("likes")
      .select("id")
      .eq("poem_id", poem.id)
      .eq("user_id", user.id)
      .single()
    isLiked = !!likeData
  }

  const poemWithDetails = {
    ...poem,
    author: Array.isArray(poem.author) ? poem.author[0] : poem.author,
    likes_count: likesCount || 0,
    comments_count: comments?.length || 0,
    is_liked: isLiked,
    comments: comments?.map(c => ({
      ...c,
      user: Array.isArray(c.user) ? c.user[0] : c.user,
    })) || [],
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userData} />
      <main className="container mx-auto px-4 py-8">
        <PoemView poem={poemWithDetails} currentUserId={user?.id} />
      </main>
    </div>
  )
}
