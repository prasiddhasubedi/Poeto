import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: currentUserData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!currentUserData?.is_admin) {
    redirect("/home")
  }

  const { count: usersCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })

  const { count: poemsCount } = await supabase
    .from("poems")
    .select("*", { count: "exact", head: true })

  const { count: commentsCount } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })

  const { count: likesCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })

  const { data: recentPoems } = await supabase
    .from("poems")
    .select(`
      id,
      title,
      content,
      created_at,
      author:users!poems_author_id_fkey (
        id,
        username,
        display_name,
        profile_picture_url
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  const { data: allUsers } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={currentUserData} />
      <main className="container mx-auto px-4 py-8">
        <AdminDashboard
          stats={{
            users: usersCount || 0,
            poems: poemsCount || 0,
            comments: commentsCount || 0,
            likes: likesCount || 0,
          }}
          recentPoems={recentPoems || []}
          allUsers={allUsers || []}
          currentUserId={user.id}
        />
      </main>
    </div>
  )
}
