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

    const slotRef = db.ref(`slots/slot${slotId}`)

    let success = false
    let updatedSlot = null

    await slotRef.transaction((slot) => {
      if (!slot) return slot

      // 🔒 block if already reserved
      if (slot.reservedBy && slot.reservedBy !== "") {
        return
      }

      // ✅ safe reserve
      return {
        ...slot,
        reservedBy: userId,
        status: "reserved",
        reservedAt: Date.now()
      }
    }, (error, committed, snapshot) => {
      if (!error && committed) {
        success = true
        updatedSlot = snapshot.val()
      }
    })

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

  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    )
  }
}