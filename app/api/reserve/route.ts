import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// =====================================================
// POST → USER clicks "RESERVE"
// =====================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slotId } = body

    if (!slotId) {
      return NextResponse.json(
        { error: "Missing slotId" },
        { status: 400 }
      )
    }

    // 🚨 THIS IS THE IMPORTANT PART (ANTI-DOUBLE BOOKING)
    const { data, error } = await supabase
      .from("slots")
      .update({
        status: "reserved",
        reserved: true,
        updated_at: new Date()
      })
      .eq("id", slotId)
      .eq("status", "available") // 🔥 prevents double booking
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // ❗ If no rows updated → already taken
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Slot already reserved or occupied" },
        { status: 409 }
      )
    }

    return NextResponse.json({
      success: true,
      slot: data[0]
    })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}