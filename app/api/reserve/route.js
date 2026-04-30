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
  }
}