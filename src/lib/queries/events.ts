"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Event } from "@/types";

/**
 * Fetches all events.
 */
export async function getEvents(): Promise<Event[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      creator:created_by(full_name)
    `)
    .order("start_time", { ascending: true });

  if (error || !data) return [];

  return data.map(event => ({
    ...event,
    creator_name: event.creator?.full_name
  }));
}

import { revalidatePath } from "next/cache";

/**
 * Creates a new event.
 */
export async function createEvent(event: Omit<Event, "id" | "created_at">) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .insert(event)
    .select()
    .single();

  if (!error) {
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
  }

  return { data, error };
}
