/**
 * GET  /api/slots        — returns all slot states (ESP32 polls this)
 * POST /api/slots/reset  — resets all slots to defaults (demo helper)
 */
import { NextResponse } from "next/server"
import { slotStore } from "@/lib/store"

export async function GET() {
  return NextResponse.json(slotStore.getAll(), {
    headers: { "Cache-Control": "no-store" },
  })
}
