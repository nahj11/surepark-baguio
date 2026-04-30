"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, runTransaction } from "firebase/database";

export default function Home() {
  const [slots, setSlots] = useState<any>({});
  const userId = "user_" + Math.random().toString(36).substring(7);

  useEffect(() => {
    const slotsRef = ref(db, "slots");

    return onValue(slotsRef, (snapshot) => {
      setSlots(snapshot.val());
    });
  }, []);

  const reserveSlot = async (slotId: string) => {
    const slotRef = ref(db, "slots/" + slotId);

    await runTransaction(slotRef, (slot) => {
      if (!slot) return;

      if (slot.status === "reserved") {
        alert("Already reserved");
        return;
      }

      return {
        ...slot,
        status: "reserved",
        reservedBy: userId,
      };
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>SurePark</h1>

      {Object.keys(slots).map((id) => {
        const slot = slots[id];
        const available = !slot.occupied && slot.status !== "reserved";

        return (
          <div key={id} style={{ marginBottom: 10 }}>
            <b>{id}</b> —{" "}
            {available ? "Available" : "Occupied/Reserved"}

            <button
              disabled={!available}
              onClick={() => reserveSlot(id)}
              style={{ marginLeft: 10 }}
            >
              Reserve
            </button>
          </div>
        );
      })}
    </div>
  );
}