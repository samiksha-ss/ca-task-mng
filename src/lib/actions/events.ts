"use server";

import { createEvent as createEventService } from "@/services/calendar-service";
import { revalidatePath } from "next/cache";

export async function createEventAction(eventData: {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_by: string;
}) {
  const result = await createEventService(eventData);
  
  if (!result.error) {
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
  }
  
  return result;
}
