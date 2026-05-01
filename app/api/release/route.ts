import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// =====================================================
// POST → manually release/reset a slot
// =====================================================
export async function POST(req: NextRequest) {
  try {
    const { slotId } = await req.json()

    if (typeof slotId !== "number") {
      return NextResponse.json(
        { ok: false, error: "slotId required" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("slots")
      .update({
        status: "available",
        reserved: false,
        paid: false,
        bollard_up: true,
        updated_at: new Date()
      })
      .eq("id", slotId)

    if (error) throw error

    return NextResponse.json({ ok: true })

  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}