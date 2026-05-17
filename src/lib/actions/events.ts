"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { 
  createRecurringEvents, 
  updateThisOccurrenceOnlyEvent, 
  updateThisAndFutureEvents, 
  updateEntireSeriesEvents, 
  deleteRecurringEvents 
} from "@/services/recurrence-service";
import type { RecurrenceRule } from "@/lib/utils/recurrence";

export async function createEventAction(
  eventData: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
  },
  rule: RecurrenceRule
) {
  const context = await requireCurrentUserContext();
  const result = await createRecurringEvents({
    ...eventData,
    createdBy: context.user.id,
  }, rule);

  if (!result.error) {
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
  }

  return result;
}

export async function updateEventAction(
  eventId: string,
  eventData: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
  },
  editType: "one" | "future" | "all",
  rule: RecurrenceRule,
  instanceDate?: string
) {
  const context = await requireCurrentUserContext();
  let result;

  if (editType === "one") {
    result = await updateThisOccurrenceOnlyEvent(eventId, eventData);
  } else if (editType === "future" && instanceDate) {
    result = await updateThisAndFutureEvents(eventId, instanceDate, {
      ...eventData,
      createdBy: context.user.id,
    }, rule);
  } else {
    // Edit entire series - we treat the current eventId as the parent template if it's the parent,
    // or retrieve the parent from the DB. Inside the service, parentId is passed.
    result = await updateEntireSeriesEvents(eventId, eventData, rule);
  }

  if (!result.error) {
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
  }

  return result;
}

export async function deleteEventAction(
  eventId: string,
  deleteType: "one" | "future" | "all",
  instanceDate?: string
) {
  const result = await deleteRecurringEvents(eventId, deleteType, instanceDate);

  if (!result.error) {
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
  }

  return result;
}
