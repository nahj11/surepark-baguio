import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// =====================================================
// POST → ESP32 sends sensor data (car detected / left)
// =====================================================
export async function POST(req: NextRequest) {
  try {
    const { slotId, carPresent } = await req.json()

    // ✅ Validate input
    if (typeof slotId !== "number" || typeof carPresent !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "slotId and carPresent required" },
        { status: 400 }
      )
    }

    // =====================================================
    // 🚗 CAR ENTERED → SET OCCUPIED
    // =====================================================
    if (carPresent === true) {
      const { error } = await supabase
        .from("slots")
        .update({
          status: "occupied",
          reserved: false,
          paid: true,
          bollard_up: false,
          updated_at: new Date()
        })
        .eq("id", slotId)

      if (error) throw error
    }

    // =====================================================
    // 🚗 CAR LEFT → RESET SLOT
    // =====================================================
    if (carPresent === false) {
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
    }

    return NextResponse.json({ ok: true })

  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Server error" },
      { status: 500 }
    )
  }
}