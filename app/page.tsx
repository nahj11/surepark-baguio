"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [slots, setSlots] = useState<any[]>([])

  // 📡 Fetch slots
  const fetchSlots = async () => {
    const { data } = await supabase.from("slots").select("*")
    if (data) setSlots(data)
  }

  useEffect(() => {
    fetchSlots()

    // 🔥 REALTIME UPDATES
    const channel = supabase
      .channel("slots")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "slots" },
        () => {
          fetchSlots()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div>
      <h1>SurePark Dashboard</h1>

      {slots.map((slot) => (
        <div key={slot.id}>
          <h3>{slot.name}</h3>
          <p>Status: {slot.status}</p>

          <button
            onClick={async () => {
              const res = await fetch("/api/reserve", {
                method: "POST",
                body: JSON.stringify({ slotId: slot.id }),
              })

              if (!res.ok) {
                alert("Slot already taken!")
              }
            }}
          >
            Reserve
          </button>
        </div>
      ))}
    </div>
  )
}