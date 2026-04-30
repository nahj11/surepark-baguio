import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebaseAdmin"

// Prevent build-time execution
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const slotId = body?.slotId
    const carPresent = body?.carPresent

    if (typeof slotId !== "number" || typeof carPresent !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "Invalid input" },
        { status: 400 }
      )
    }

    const slotRef = db.ref(`slots/slot${slotId}`)

    await slotRef.update({
      sensorStatus: carPresent ? "occupied" : "available"
    })

    return NextResponse.json({ ok: true })

  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    )
  }
}