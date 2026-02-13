import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content } = body

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: "Poem content must be at least 10 characters" },
        { status: 400 }
      )
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: "Poem content is too long (max 5000 characters)" },
        { status: 400 }
      )
    }

    if (title && title.length > 200) {
      return NextResponse.json(
        { error: "Title is too long (max 200 characters)" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("poems")
      .update({
        title: title?.trim() || null,
        content: content.trim(),
        edited_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("author_id", user.id)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: "Poem not found or unauthorized" },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating poem:", error)
    return NextResponse.json(
      { error: "Failed to update poem" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from("poems")
      .delete()
      .eq("id", id)
      .eq("author_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting poem:", error)
    return NextResponse.json(
      { error: "Failed to delete poem" },
      { status: 500 }
    )
  }
}
