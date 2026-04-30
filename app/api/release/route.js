import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { slotId, userId } = await req.json();

  const ref = db.ref(`slots/${slotId}`);

  try {
    await ref.transaction((slot) => {
      if (!slot) return slot;

      // ❌ not owner
      if (slot.userId !== userId) return;

      // ✅ release
      slot.reserved = false;
      slot.userId = null;

      return slot;
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}