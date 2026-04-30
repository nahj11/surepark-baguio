import { NextRequest, NextResponse } from "next/server"
import { ref, get, update } from "firebase/database"
import { db } from "@/lib/firebase"

// =====================================================
// GET → ESP32 polls this every ~2 seconds
// =====================================================
export async function GET(req: NextRequest) {
  const slotId = Number(req.nextUrl.searchParams.get("slotId"))

  if (!slotId) {
    return NextResponse.json(
      { ok: false, error: "slotId required" },
      { status: 400 }
    )
  }

  try {
    const snapshot = await get(ref(db, `slots/slot${slotId}`))

    if (!snapshot.exists()) {
      return NextResponse.json(
        { ok: false, error: `Slot ${slotId} not found` },
        { status: 404 }
      )
    }

    const slot = snapshot.val()

    return NextResponse.json(
      {
        ok: true,
        slotId: slotId,

        // ✅ derive from Firebase
        reserved: slot.reservedBy !== "",
        paid: slot.paid || false,
        bollardUp: slot.bollardUp ?? true,

        // IMPORTANT: use sensorStatus (NOT status)
        occupied: slot.sensorStatus === "occupied",
      },
      { headers: { "Cache-Control": "no-store" } }
    )

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Failed to fetch slot" },
      { status: 500 }
    )
  }
}


// =====================================================
// POST → App activates slot (open gate)
// =====================================================
export async function POST(req: NextRequest) {
  let body

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  const { slotId, activated } = body

  if (typeof slotId !== "number" || typeof activated !== "boolean") {
    return NextResponse.json(
      { ok: false, error: "slotId (number) and activated (boolean) required" },
      { status: 400 }
    )
  }

  try {
    const slotRef = ref(db, `slots/slot${slotId}`)
    const snapshot = await get(slotRef)

    if (!snapshot.exists()) {
      return NextResponse.json(
        { ok: false, error: `Slot ${slotId} not found` },
        { status: 404 }
      )
    }

    const slot = snapshot.val()

    // 🚫 VALIDATION (same as your old logic)
    if (activated && slot.reservedBy === "") {
      return NextResponse.json(
        { ok: false, error: "Slot must be reserved first" },
        { status: 403 }
      )
    }

    if (activated && !slot.paid) {
      return NextResponse.json(
        { ok: false, error: "Payment required before activation" },
        { status: 403 }
      )
    }

    // ✅ UPDATE FIREBASE ONLY
    await update(slotRef, {
      activated: activated,
      bollardUp: activated ? false : true   // open when activated
    })

    return NextResponse.json({ ok: true })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Failed to update slot" },
      { status: 500 }
    )
  }
}