"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function generatePairingCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function initiatePairing() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: "You must be logged in to add a screen." };
  }

  let pairingCode: string;
  let isUnique = false;
  let attempts = 0;

  // Retry generating a pairing code if a collision occurs (highly unlikely)
  do {
    pairingCode = generatePairingCode();
    const { data, error } = await supabase
      .from("devices")
      .select("pairing_code")
      .eq("pairing_code", pairingCode)
      .single();

    if (error && error.code !== "PGRST116") { // 'PGRST116' is "No rows found"
      console.error("Error checking pairing code uniqueness:", error);
      return { error: "Failed to verify pairing code uniqueness." };
    }

    if (!data) {
      isUnique = true;
    }

    attempts++;
  } while (!isUnique && attempts < 5);

  if (!isUnique) {
    return { error: "Failed to generate a unique pairing code after several attempts." };
  }

  const deviceData = {
    device_name: "New Screen",
    pairing_code: pairingCode,
    uuid: `placeholder-${Date.now()}`, // Placeholder UUID
    status: "pairing",
    owner_id: session.user.id,
  };

  const { data: newDevice, error: insertError } = await supabase
    .from("devices")
    .insert(deviceData)
    .select()
    .single();

  if (insertError) {
    console.error("Error creating new device:", insertError);
    return { error: "Failed to create a new screen in the database." };
  }

  // Revalidate the screens page to show the new device
  revalidatePath("/screens");

  return { success: true, device: newDevice };
}
