import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client (server-side safe)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// =====================================================
// GET → ESP32 polls this every ~1 second
// =====================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slotId = searchParams.get("slotId")

    if (!slotId) {
      return NextResponse.json(
        { error: "Missing slotId" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .eq("id", Number(slotId))
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      slot: data
    })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}

// =====================================================
// POST → ESP32 sends sensor updates (car detected)
// =====================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slotId, carPresent } = body

    if (slotId === undefined || carPresent === undefined) {
      return NextResponse.json(
        { error: "Missing slotId or carPresent" },
        { status: 400 }
      )
    }

    // 🚗 IF CAR ENTERS → OCCUPIED
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

    // 🚗 IF CAR LEAVES → RESET TO AVAILABLE
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

    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}