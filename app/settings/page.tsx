import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { EditProfileForm } from "@/components/settings/edit-profile-form"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!userData) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userData} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <h1 className="text-2xl font-bold">Edit Profile</h1>
              <CardDescription>
                Update your profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditProfileForm user={userData} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
