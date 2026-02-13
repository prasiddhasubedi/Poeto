"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { validateUsername } from "@/lib/utils"
import type { User } from "@/types"

interface EditProfileFormProps {
  user: User
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const [username, setUsername] = React.useState(user.username)
  const [displayName, setDisplayName] = React.useState(user.display_name)
  const [bio, setBio] = React.useState(user.bio || "")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!displayName.trim()) {
      setError("Display name is required")
      return
    }

    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
      setError(usernameValidation.error || "Invalid username")
      return
    }

    if (username !== user.username) {
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        setError("Failed to check username availability")
        return
      }

      if (existingUser) {
        setError("Username is already taken")
        return
      }
    }

    setIsLoading(true)

    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          username,
          display_name: displayName,
          bio: bio.trim() || null,
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      router.push(`/${username}`)
      router.refresh()
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          placeholder="username"
          disabled={isLoading}
          required
        />
        <p className="text-xs text-muted-foreground">
          3-20 characters, lowercase letters, numbers, and underscores only
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="displayName" className="text-sm font-medium">
          Display Name
        </label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          disabled={isLoading}
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">
          {bio.length}/500 characters
        </p>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
