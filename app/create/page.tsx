import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"
import { PoemForm } from "@/components/poem/poem-form"
import { Button } from "@/components/ui/button"

export default async function CreatePoemPage() {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userData} />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href="/home">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Create a Poem</h1>
            <p className="text-muted-foreground mt-2">
              Share your poetry with the world
            </p>
          </div>

          <PoemForm />
        </div>
      </main>
    </div>
  )
}
