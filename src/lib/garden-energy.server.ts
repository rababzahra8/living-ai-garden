import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ENERGY_JOKE_BONUS,
  ENERGY_PER_MESSAGE,
  ENERGY_PER_NEW_FLOWER,
} from "@/lib/garden-energy";

type GardenRow = { energy: number; next_conversation_number: number };

async function ensureUserGarden(supabase: SupabaseClient, userId: string): Promise<GardenRow> {
  const { data } = await supabase
    .from("user_garden")
    .select("energy, next_conversation_number")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) return data;

  const { data: created, error } = await supabase
    .from("user_garden")
    .insert({ user_id: userId, energy: 0, next_conversation_number: 1 })
    .select("energy, next_conversation_number")
    .single();

  if (error) throw error;
  return created;
}

export async function addGardenEnergy(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
): Promise<number> {
  const row = await ensureUserGarden(supabase, userId);
  const next = row.energy + amount;
  const { error } = await supabase
    .from("user_garden")
    .update({ energy: next, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw error;
  return next;
}

export async function allocateConversationNumber(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const row = await ensureUserGarden(supabase, userId);
  const number = row.next_conversation_number;
  const { error } = await supabase
    .from("user_garden")
    .update({
      next_conversation_number: number + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  if (error) throw error;
  return number;
}

export async function grantMessageEnergy(
  supabase: SupabaseClient,
  userId: string,
  opts: { isNewFlower: boolean; watered: boolean },
): Promise<number> {
  let amount = opts.isNewFlower ? ENERGY_PER_NEW_FLOWER : ENERGY_PER_MESSAGE;
  if (opts.watered) amount += ENERGY_JOKE_BONUS;
  return addGardenEnergy(supabase, userId, amount);
}
