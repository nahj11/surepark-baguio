<<<<<<< HEAD
import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { slotId, userId } = await req.json();

  const ref = db.ref(`slots/${slotId}`);

  try {
    await ref.transaction((slot) => {
      if (!slot) return slot;

      // ❌ someone else owns it
      if (slot.reserved && slot.userId !== userId) {
        return;
      }

      // ✅ reserve
      slot.reserved = true;
      slot.userId = userId;
      slot.timestamp = Date.now();

      return slot;
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
=======
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebaseAdmin"

// Prevent static evaluation during build
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const slotId = body?.slotId
    const userId = body?.userId

    if (!slotId || !userId) {
      return NextResponse.json(
        { ok: false, error: "slotId and userId required" },
        { status: 400 }
      )
    }

    const slotRef = db.ref(`slots/slot${slotId}`)

    let success = false
    let updatedSlot: any = null

    await slotRef.transaction(
      (slot) => {
        if (!slot) return slot

        // Block if already reserved
        if (slot.reservedBy && slot.reservedBy !== "") {
          return
        }

        return {
          ...slot,
          reservedBy: userId,
          status: "reserved",
          reservedAt: Date.now(),
        }
      },
      (error, committed, snapshot) => {
        if (!error && committed) {
          success = true
          updatedSlot = snapshot?.val() || null
        }
      }
    )

    if (!success) {
      return NextResponse.json(
        { ok: false, error: "Slot already taken" },
        { status: 409 }
      )
    }

    return NextResponse.json({
      ok: true,
      slot: updatedSlot,
    })

  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    )
>>>>>>> 5a7118607394d510285464c9608b6d2849604f96
  }
}