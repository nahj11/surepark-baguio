/**
 * GET  /api/command?slotId=1
 *   ESP32 polls this every 2 seconds.
 *   Returns whether the app has activated this slot (user paid + pressed Activate).
 *   Response: { activated: true/false, bollardUp: true/false }
 *
 * POST /api/command
 *   Dashboard sends this when user presses "Activate Slot" button.
 *   Body: { slotId: 1, activated: true }
 *   This replaces both physical buttons on the ESP32.
 */
import { NextRequest, NextResponse } from "next/server"
import { slotStore } from "@/lib/store"

export async function GET(req: NextRequest) {
  const slotId = Number(req.nextUrl.searchParams.get("slotId"))
  if (!slotId) {
    return NextResponse.json({ ok: false, error: "slotId required" }, { status: 400 })
  }

  const slot = slotStore.getById(slotId)
  if (!slot) {
    return NextResponse.json({ ok: false, error: `Slot ${slotId} not found` }, { status: 404 })
  }

  return NextResponse.json(
    {
      ok:        true,
      slotId:    slot.id,
      reserved:  slot.status === "reserved",  // blue LED
      paid:      slot.paid ?? false,           // gate unlock condition
      bollardUp: slot.bollardUp ?? true,       // true = closed, false = open
      occupied:  slot.status === "occupied",  // red LED
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}

export async function POST(req: NextRequest) {
  let body: { slotId?: number; activated?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const { slotId, activated } = body

  if (typeof slotId !== "number" || typeof activated !== "boolean") {
    return NextResponse.json(
      { ok: false, error: "Required: slotId (number) and activated (boolean)" },
      { status: 400 },
    )
  }

  const slot = slotStore.getById(slotId)
  if (!slot) {
    return NextResponse.json({ ok: false, error: `Slot ${slotId} not found` }, { status: 404 })
  }

  // Only allow activation if slot is reserved and paid
  if (activated && slot.status !== "reserved") {
    return NextResponse.json(
      { ok: false, error: "Slot must be reserved before activating" },
      { status: 403 },
    )
  }

  if (activated && !slot.paid) {
    return NextResponse.json(
      { ok: false, error: "Payment must be completed before activating" },
      { status: 403 },
    )
  }

  const updated = slotStore.update(slotId, { activated })
  return NextResponse.json({ ok: true, slot: updated })
}
