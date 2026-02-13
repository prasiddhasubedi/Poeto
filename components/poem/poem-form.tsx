"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface PoemFormProps {
  onCancel?: () => void
  initialValues?: {
    title?: string
    content?: string
  }
  poemId?: string
}

const MAX_CONTENT_LENGTH = 5000

export function PoemForm({ onCancel, initialValues, poemId }: PoemFormProps) {
  const [title, setTitle] = React.useState(initialValues?.title || "")
  const [content, setContent] = React.useState(initialValues?.content || "")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError("Poem content is required")
      addToast("Poem content is required", "error")
      return
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      setError(`Poem content must be less than ${MAX_CONTENT_LENGTH} characters`)
      addToast(`Poem content must be less than ${MAX_CONTENT_LENGTH} characters`, "error")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError("You must be signed in to create a poem")
        addToast("You must be signed in to create a poem", "error")
        setIsSubmitting(false)
        return
      }

      if (poemId) {
        const { error: updateError } = await supabase
          .from("poems")
          .update({
            title: title.trim() || null,
            content: content.trim(),
            edited_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", poemId)
          .eq("author_id", user.id)

        if (updateError) throw updateError
        addToast("Poem updated successfully!", "success")
      } else {
        const { error: insertError } = await supabase
          .from("poems")
          .insert({
            author_id: user.id,
            title: title.trim() || null,
            content: content.trim(),
          })

        if (insertError) throw insertError
        addToast("Poem published successfully!", "success")
      }

      router.push("/home")
      router.refresh()
    } catch (err) {
      console.error("Error saving poem:", err)
      const errorMsg = "Failed to save poem. Please try again."
      setError(errorMsg)
      addToast(errorMsg, "error")
      setIsSubmitting(false)
    }
  }

  const characterCount = content.length
  const isOverLimit = characterCount > MAX_CONTENT_LENGTH

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Write your poem here...&#10;&#10;Line breaks will be preserved."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
          className="min-h-[300px] font-serif text-base leading-relaxed resize-none"
          required
        />
        <div className="flex justify-between items-center text-sm">
          <span className={isOverLimit ? "text-destructive" : "text-muted-foreground"}>
            {characterCount} / {MAX_CONTENT_LENGTH}
          </span>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || !content.trim() || isOverLimit}>
          {isSubmitting ? "Publishing..." : poemId ? "Update" : "Publish"}
        </Button>
      </div>
    </form>
  )
}
