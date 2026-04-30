import { db } from "@/lib/firebaseAdmin"
import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    const { slotId, userId } = await req.json()

    if (!slotId || !userId) {
      return NextResponse.json(
        { ok: false, error: "slotId and userId required" },
        { status: 400 }
      )
    }

    // ✅ correct path (IMPORTANT)
    const slotRef = db.ref(`slots/slot${slotId}`)

    let success = false
    let updatedSlot = null

    await slotRef.transaction((slot) => {
      if (!slot) return slot

      // 🔒 BLOCK if already reserved
      if (slot.reservedBy && slot.reservedBy !== "") {
        return // abort transaction
      }

      // ✅ SAFE RESERVE
      slot.reservedBy = userId
      slot.status = "reserved"
      slot.reservedAt = Date.now()

      success = true
      updatedSlot = slot

      return slot
    })

    // ❌ transaction failed
    if (!success) {
      return NextResponse.json(
        { ok: false, error: "Slot already taken" },
        { status: 409 }
      )
    }

    return NextResponse.json({
      ok: true,
      slot: updatedSlot
    })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}