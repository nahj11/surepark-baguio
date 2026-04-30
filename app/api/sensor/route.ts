import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebaseAdmin"

export async function POST(req: NextRequest) {
  try {
    const { slotId, carPresent } = await req.json()

    if (typeof slotId !== "number" || typeof carPresent !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "slotId (number) and carPresent (boolean) required" },
        { status: 400 }
      )
    }

    // ✅ correct Firebase path
    const slotRef = db.ref(`slots/slot${slotId}`)

    // ✅ ONLY update sensorStatus
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