import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user profile exists, if not create it
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.user.id)
        .single()

      if (!existingUser) {
        // Extract username from email or use default
        const email = data.user.email || ""
        const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_")
        
        await supabase.from("users").insert([
          {
            id: data.user.id,
            email: data.user.email || "",
            username: username + "_" + Math.random().toString(36).substring(7),
            display_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || username,
            profile_picture_url: data.user.user_metadata?.avatar_url || null,
          }
        ])
      }
    }
  }

  return NextResponse.redirect(new URL("/home", requestUrl.origin))
}
