import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"
import SearchResults from "./search-results"
import { PoemCardSkeleton } from "@/components/ui/skeleton"

export default async function SearchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userData } = user
    ? await supabase
        .from("users")
        .select("id, username, display_name, profile_picture_url, is_admin")
        .eq("id", user.id)
        .single()
    : { data: null }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userData} />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <PoemCardSkeleton />
            <PoemCardSkeleton />
            <PoemCardSkeleton />
          </div>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  )
}
