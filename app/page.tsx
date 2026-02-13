import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/home')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Poeto
          </Link>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            A Social Home for Poets
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Share your poems, connect with fellow poets, and discover beautiful poetry from around the world
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline">Explore Poems</Button>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-4">✍️</div>
              <h3 className="text-xl font-semibold mb-2">Share Your Poetry</h3>
              <p className="text-muted-foreground">
                Express yourself through words and share your poems with the community
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Connect with Poets</h3>
              <p className="text-muted-foreground">
                Follow your favorite poets and build meaningful connections
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Discover Poetry</h3>
              <p className="text-muted-foreground">
                Explore trending poems and find new voices in the poetry community
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Poeto. A social platform for poets.</p>
        </div>
      </footer>
    </div>
  )
}
