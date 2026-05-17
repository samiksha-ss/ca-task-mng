/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { 
  generateOccurrences, 
  formatToISODate, 
  type RecurrenceRule,
  type RecurrenceIntervalType,
  type RecurrenceEndType
} from "@/lib/utils/recurrence";

/**
 * Task Recurrence Services
 */

export async function createRecurringTasks(input: any, rule: RecurrenceRule) {
  const supabase = await createSupabaseServerClient();

  // 1. Create the parent task (which acts as the master template)
  const { data: parentTask, error: parentError } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      description: input.description || null,
      company_id: input.companyId || null,
      team_id: input.teamId || null,
      assigned_to: input.assignedTo || null,
      due_date: input.dueDate || null,
      priority: input.priority,
      status: input.status,
      estimated_minutes: input.estimatedMinutes,
      billable: input.billable,
      created_by: input.createdBy,
      recurrence_interval_type: rule.intervalType,
      recurrence_interval_count: rule.intervalCount,
      recurrence_weekdays: rule.weekdays || null,
      recurrence_end_type: rule.endType,
      recurrence_end_date: rule.endDate || null,
      recurrence_end_count: rule.endCount || null,
      recurrence_instance_date: input.dueDate ? formatToISODate(new Date(input.dueDate)) : null,
    })
    .select()
    .single();

  if (parentError || !parentTask) {
    return { error: parentError?.message || "Failed to create parent task template." };
  }

  return { success: true, data: parentTask };
}

export async function updateThisOccurrenceOnlyTask(taskId: string, input: any) {
  const supabase = await createSupabaseServerClient();
  
  const { error } = await supabase
    .from("tasks")
    .update({
      title: input.title,
      description: input.description || null,
      company_id: input.companyId || null,
      team_id: input.teamId || null,
      assigned_to: input.assignedTo || null,
      due_date: input.dueDate || null,
      priority: input.priority,
      status: input.status,
      estimated_minutes: input.estimatedMinutes,
      billable: input.billable,
      recurrence_exception: true, // Sever connection for series cascades
    })
    .eq("id", taskId);

  return { error: error?.message ?? null };
}

export async function updateThisAndFutureTasks(
  currentTaskId: string,
  instanceDate: string,
  updatedInput: any,
  newRule: RecurrenceRule
) {
  const supabase = await createSupabaseServerClient();

  // 1. Retrieve the current occurrence row
  const { data: currentTask, error: fetchError } = await supabase
    .from("tasks")
    .select("recurrence_parent_id")
    .eq("id", currentTaskId)
    .single();

  if (fetchError || !currentTask) {
    return { error: fetchError?.message || "Task not found." };
  }

  const parentId = currentTask.recurrence_parent_id;

  if (parentId) {
    // 2. Adjust old parent series: set its end date to right before this occurrence
    const endBoundary = new Date(instanceDate);
    endBoundary.setDate(endBoundary.getDate() - 1);
    
    await supabase
      .from("tasks")
      .update({
        recurrence_end_type: "date",
        recurrence_end_date: endBoundary.toISOString(),
      })
      .eq("id", parentId);

    // 3. Delete unmodified future occurrences linked to the old parent series
    await supabase
      .from("tasks")
      .delete()
      .eq("recurrence_parent_id", parentId)
      .gte("recurrence_instance_date", instanceDate)
      .eq("recurrence_exception", false);
  }

  // 4. Create new recurring task series starting from the current date
  return createRecurringTasks({
    ...updatedInput,
    dueDate: instanceDate,
  }, newRule);
}

export async function updateEntireSeriesTasks(parentId: string, updatedInput: any, newRule: RecurrenceRule) {
  const supabase = await createSupabaseServerClient();

  // 1. Update the original parent series details
  const { error: parentUpdateError } = await supabase
    .from("tasks")
    .update({
      title: updatedInput.title,
      description: updatedInput.description || null,
      company_id: updatedInput.companyId || null,
      team_id: updatedInput.teamId || null,
      assigned_to: updatedInput.assignedTo || null,
      priority: updatedInput.priority,
      status: updatedInput.status,
      estimated_minutes: updatedInput.estimatedMinutes,
      billable: updatedInput.billable,
      recurrence_interval_type: newRule.intervalType,
      recurrence_interval_count: newRule.intervalCount,
      recurrence_weekdays: newRule.weekdays || null,
      recurrence_end_type: newRule.endType,
      recurrence_end_date: newRule.endDate || null,
      recurrence_end_count: newRule.endCount || null,
    })
    .eq("id", parentId);

  if (parentUpdateError) {
    return { error: parentUpdateError.message };
  }

  // 2. Fetch all other occurrences
  const { data: siblingTasks } = await supabase
    .from("tasks")
    .select("id, recurrence_exception")
    .eq("recurrence_parent_id", parentId);

  if (siblingTasks && siblingTasks.length > 0) {
    // 3. Update active unmodified sibling occurrences properties
    const unmodifiedIds = siblingTasks.filter(t => !t.recurrence_exception).map(t => t.id);
    
    if (unmodifiedIds.length > 0) {
      await supabase
        .from("tasks")
        .update({
          title: updatedInput.title,
          description: updatedInput.description || null,
          company_id: updatedInput.companyId || null,
          team_id: updatedInput.teamId || null,
          assigned_to: updatedInput.assignedTo || null,
          priority: updatedInput.priority,
          status: updatedInput.status,
          estimated_minutes: updatedInput.estimatedMinutes,
          billable: updatedInput.billable,
          recurrence_interval_type: newRule.intervalType,
          recurrence_interval_count: newRule.intervalCount,
          recurrence_weekdays: newRule.weekdays || null,
          recurrence_end_type: newRule.endType,
          recurrence_end_date: newRule.endDate || null,
          recurrence_end_count: newRule.endCount || null,
        })
        .in("id", unmodifiedIds);
    }
  }

  return { success: true };
}

export async function deleteRecurringTasks(taskId: string, deleteType: "one" | "future" | "all", instanceDate?: string) {
  const supabase = await createSupabaseServerClient();

  // Fetch task first
  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("recurrence_parent_id, recurrence_instance_date")
    .eq("id", taskId)
    .single();

  if (fetchError || !task) {
    return { error: fetchError?.message || "Task not found." };
  }

  const parentId = task.recurrence_parent_id || taskId;
  const targetDate = instanceDate || task.recurrence_instance_date || formatToISODate(new Date());

  if (deleteType === "one") {
    // Delete only the selected task row
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    return { error: error?.message ?? null };
  } 
  
  else if (deleteType === "future") {
    // Set old series boundary
    const endBoundary = new Date(targetDate);
    endBoundary.setDate(endBoundary.getDate() - 1);

    await supabase
      .from("tasks")
      .update({
        recurrence_end_type: "date",
        recurrence_end_date: endBoundary.toISOString(),
      })
      .eq("id", parentId);

    // Delete future tasks in series
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("recurrence_parent_id", parentId)
      .gte("recurrence_instance_date", targetDate);

    return { error: error?.message ?? null };
  } 
  
  else {
    // Delete entire series (parent + children)
    const { error: childrenError } = await supabase
      .from("tasks")
      .delete()
      .eq("recurrence_parent_id", parentId);

    const { error: parentError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", parentId);

    return { error: childrenError?.message || parentError?.message || null };
  }
}


/**
 * Event Recurrence Services
 */

export async function createRecurringEvents(input: any, rule: RecurrenceRule) {
  const supabase = await createSupabaseServerClient();

  // Get user's team_id to associate with the event
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", input.createdBy)
    .single();

  // 1. Create the parent event template
  const { data: parentEvent, error: parentError } = await supabase
    .from("events")
    .insert({
      title: input.title,
      description: input.description || null,
      start_time: input.startTime,
      end_time: input.endTime,
      team_id: profile?.team_id || null,
      created_by: input.createdBy,
      recurrence_interval_type: rule.intervalType,
      recurrence_interval_count: rule.intervalCount,
      recurrence_weekdays: rule.weekdays || null,
      recurrence_end_type: rule.endType,
      recurrence_end_date: rule.endDate || null,
      recurrence_end_count: rule.endCount || null,
      recurrence_instance_date: formatToISODate(new Date(input.startTime)),
    })
    .select()
    .single();

  if (parentError || !parentEvent) {
    return { error: parentError?.message || "Failed to create parent event template." };
  }

  if (rule.intervalType === "none") {
    return { success: true, data: parentEvent };
  }

  // 2. Generate future occurrence dates
  const baseStartDate = new Date(input.startTime);
  const occurrences = generateOccurrences(baseStartDate, rule);

  // Filter out first date
  const futureOccurrences = occurrences.filter(occ => formatToISODate(occ) !== formatToISODate(baseStartDate));

  if (futureOccurrences.length > 0) {
    const durationMs = new Date(input.endTime).getTime() - baseStartDate.getTime();
    const originalStartHours = baseStartDate.getHours();
    const originalStartMins = baseStartDate.getMinutes();

    const eventRows = futureOccurrences.map(occDate => {
      const occDateStr = formatToISODate(occDate);
      
      const occStart = new Date(occDate.getTime());
      occStart.setHours(originalStartHours, originalStartMins, 0, 0);

      const occEnd = new Date(occStart.getTime() + durationMs);

      return {
        title: input.title,
        description: input.description || null,
        team_id: profile?.team_id || null,
        created_by: input.createdBy,
        start_time: occStart.toISOString(),
        end_time: occEnd.toISOString(),
        recurrence_parent_id: parentEvent.id,
        recurrence_interval_type: rule.intervalType,
        recurrence_interval_count: rule.intervalCount,
        recurrence_weekdays: rule.weekdays || null,
        recurrence_end_type: rule.endType,
        recurrence_end_date: rule.endDate || null,
        recurrence_end_count: rule.endCount || null,
        recurrence_instance_date: occDateStr,
        recurrence_exception: false,
      };
    });

    const { error: batchError } = await supabase.from("events").insert(eventRows);
    if (batchError) {
      console.error("Failed to generate event occurrences:", batchError.message);
    }
  }

  return { success: true, data: parentEvent };
}

export async function updateThisOccurrenceOnlyEvent(eventId: string, input: any) {
  const supabase = await createSupabaseServerClient();
  
  const { error } = await supabase
    .from("events")
    .update({
      title: input.title,
      description: input.description || null,
      start_time: input.startTime,
      end_time: input.endTime,
      recurrence_exception: true, // Mark override exceptions
    })
    .eq("id", eventId);

  return { error: error?.message ?? null };
}

export async function updateThisAndFutureEvents(
  currentEventId: string,
  instanceDate: string,
  updatedInput: any,
  newRule: RecurrenceRule
) {
  const supabase = await createSupabaseServerClient();

  // 1. Retrieve current event row
  const { data: currentEvent, error: fetchError } = await supabase
    .from("events")
    .select("recurrence_parent_id")
    .eq("id", currentEventId)
    .single();

  if (fetchError || !currentEvent) {
    return { error: fetchError?.message || "Event not found." };
  }

  const parentId = currentEvent.recurrence_parent_id;

  if (parentId) {
    // 2. Adjust old parent series
    const endBoundary = new Date(instanceDate);
    endBoundary.setDate(endBoundary.getDate() - 1);
    
    await supabase
      .from("events")
      .update({
        recurrence_end_type: "date",
        recurrence_end_date: endBoundary.toISOString(),
      })
      .eq("id", parentId);

    // 3. Delete unmodified future occurrences linked to the old series
    await supabase
      .from("events")
      .delete()
      .eq("recurrence_parent_id", parentId)
      .gte("recurrence_instance_date", instanceDate)
      .eq("recurrence_exception", false);
  }

  // 4. Create new recurring event series
  return createRecurringEvents({
    ...updatedInput,
    startTime: updatedInput.startTime,
    endTime: updatedInput.endTime,
  }, newRule);
}

export async function updateEntireSeriesEvents(parentId: string, updatedInput: any, newRule: RecurrenceRule) {
  const supabase = await createSupabaseServerClient();

  // 1. Update the original parent series details
  const { error: parentUpdateError } = await supabase
    .from("events")
    .update({
      title: updatedInput.title,
      description: updatedInput.description || null,
      recurrence_interval_type: newRule.intervalType,
      recurrence_interval_count: newRule.intervalCount,
      recurrence_weekdays: newRule.weekdays || null,
      recurrence_end_type: newRule.endType,
      recurrence_end_date: newRule.endDate || null,
      recurrence_end_count: newRule.endCount || null,
    })
    .eq("id", parentId);

  if (parentUpdateError) {
    return { error: parentUpdateError.message };
  }

  // 2. Fetch all other occurrences
  const { data: siblingEvents } = await supabase
    .from("events")
    .select("id, recurrence_exception, start_time, end_time")
    .eq("recurrence_parent_id", parentId);

  if (siblingEvents && siblingEvents.length > 0) {
    const unmodifiedEvents = siblingEvents.filter(e => !e.recurrence_exception);
    
    if (unmodifiedEvents.length > 0) {
      // Loop to safely update sibling properties while maintaining individual occurrence hours
      const durationMs = new Date(updatedInput.endTime).getTime() - new Date(updatedInput.startTime).getTime();
      const newStartHours = new Date(updatedInput.startTime).getHours();
      const newStartMins = new Date(updatedInput.startTime).getMinutes();

      for (const sibling of unmodifiedEvents) {
        const occStart = new Date(sibling.start_time);
        occStart.setHours(newStartHours, newStartMins, 0, 0);
        const occEnd = new Date(occStart.getTime() + durationMs);

        await supabase
          .from("events")
          .update({
            title: updatedInput.title,
            description: updatedInput.description || null,
            start_time: occStart.toISOString(),
            end_time: occEnd.toISOString(),
            recurrence_interval_type: newRule.intervalType,
            recurrence_interval_count: newRule.intervalCount,
            recurrence_weekdays: newRule.weekdays || null,
            recurrence_end_type: newRule.endType,
            recurrence_end_date: newRule.endDate || null,
            recurrence_end_count: newRule.endCount || null,
          })
          .eq("id", sibling.id);
      }
    }
  }

  return { success: true };
}

export async function deleteRecurringEvents(eventId: string, deleteType: "one" | "future" | "all", instanceDate?: string) {
  const supabase = await createSupabaseServerClient();

  // Fetch event details
  const { data: event, error: fetchError } = await supabase
    .from("events")
    .select("recurrence_parent_id, recurrence_instance_date")
    .eq("id", eventId)
    .single();

  if (fetchError || !event) {
    return { error: fetchError?.message || "Event not found." };
  }

  const parentId = event.recurrence_parent_id || eventId;
  const targetDate = instanceDate || event.recurrence_instance_date || formatToISODate(new Date());

  if (deleteType === "one") {
    // Delete only the single selected event
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    return { error: error?.message ?? null };
  } 
  
  else if (deleteType === "future") {
    // Set old series boundary
    const endBoundary = new Date(targetDate);
    endBoundary.setDate(endBoundary.getDate() - 1);

    await supabase
      .from("events")
      .update({
        recurrence_end_type: "date",
        recurrence_end_date: endBoundary.toISOString(),
      })
      .eq("id", parentId);

    // Delete future siblings
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("recurrence_parent_id", parentId)
      .gte("recurrence_instance_date", targetDate);

    return { error: error?.message ?? null };
  } 
  
  else {
    // Delete entire series (parent + children)
    const { error: childrenError } = await supabase
      .from("events")
      .delete()
      .eq("recurrence_parent_id", parentId);

    const { error: parentError } = await supabase
      .from("events")
      .delete()
      .eq("id", parentId);

    return { error: childrenError?.message || parentError?.message || null };
  }
}

export async function handleSequentialTaskCompletion(taskId: string) {
  const supabase = await createSupabaseServerClient();
  
  // 1. Fetch the completed task details
  const { data: completedTask, error: fetchError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (fetchError || !completedTask) {
    console.error("Task completion fetch failed:", fetchError?.message);
    return;
  }

  // 2. Only process tasks belonging to a recurrence series
  if (!completedTask.recurrence_interval_type || completedTask.recurrence_interval_type === "none") {
    return;
  }

  // 3. Determine the master parent task ID
  const seriesParentId = completedTask.recurrence_parent_id || completedTask.id;

  // 4. PREVENT DUPLICATES: Check if there is ALREADY an active (incomplete) task in this series in the DB
  const { data: existingActiveTasks, error: checkError } = await supabase
    .from("tasks")
    .select("id")
    .neq("status", "done")
    .or(`id.eq.${seriesParentId},recurrence_parent_id.eq.${seriesParentId}`);

  if (checkError) {
    console.error("Error checking active tasks in series:", checkError.message);
    return;
  }

  // If there is already an active incomplete task in this series, skip spawning to prevent duplicates
  if (existingActiveTasks && existingActiveTasks.length > 0) {
    console.log("An incomplete task already exists in this recurrence series. Skipping duplicate generation.");
    return;
  }

  // 5. Calculate the next occurrence date
  const rule: RecurrenceRule = {
    intervalType: completedTask.recurrence_interval_type as RecurrenceIntervalType,
    intervalCount: completedTask.recurrence_interval_count ?? 1,
    weekdays: completedTask.recurrence_weekdays || null,
    endType: completedTask.recurrence_end_type as RecurrenceEndType,
    endDate: completedTask.recurrence_end_date || null,
    endCount: completedTask.recurrence_end_count || null,
  };

  const baseDate = completedTask.due_date ? new Date(completedTask.due_date) : new Date();
  const occurrences = generateOccurrences(baseDate, rule);

  // Filter occurrence dates strictly AFTER the current base date
  const futureOccurrences = occurrences.filter(occ => formatToISODate(occ) > formatToISODate(baseDate));

  if (futureOccurrences.length === 0) {
    console.log("No further occurrences remaining for this series based on the recurrence rules.");
    return;
  }

  const nextDueDate = futureOccurrences[0];
  const nextDueDateStr = formatToISODate(nextDueDate);

  // 6. Check end boundaries
  // Check date limit
  if (rule.endType === "date" && rule.endDate) {
    const endBoundary = new Date(rule.endDate);
    if (nextDueDate > endBoundary) {
      console.log("Next occurrence date exceeds the series end date. Recurrence ended.");
      return;
    }
  }

  // Check count limit
  if (rule.endType === "count" && rule.endCount) {
    const { count, error: countError } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .or(`id.eq.${seriesParentId},recurrence_parent_id.eq.${seriesParentId}`);

    if (countError) {
      console.error("Error counting tasks in series:", countError.message);
      return;
    }

    if (count && count >= rule.endCount) {
      console.log("Recurrence limit reached. Maximum occurrence count reached.");
      return;
    }
  }

  // 7. Calculate start date preserving duration gap
  let nextStartDate = null;
  if (completedTask.start_date && completedTask.due_date) {
    const gapMs = new Date(completedTask.due_date).getTime() - new Date(completedTask.start_date).getTime();
    nextStartDate = new Date(nextDueDate.getTime() - gapMs).toISOString();
  }

  // 8. Insert the next single occurrence into the database
  const { error: spawnError } = await supabase
    .from("tasks")
    .insert({
      title: completedTask.title,
      description: completedTask.description,
      company_id: completedTask.company_id,
      team_id: completedTask.team_id,
      assigned_to: completedTask.assigned_to,
      priority: completedTask.priority,
      status: "todo", // Spawned task starts in 'todo' status
      estimated_minutes: completedTask.estimated_minutes,
      billable: completedTask.billable,
      created_by: completedTask.created_by,
      start_date: nextStartDate,
      due_date: nextDueDate.toISOString(),
      recurrence_parent_id: seriesParentId,
      recurrence_interval_type: completedTask.recurrence_interval_type,
      recurrence_interval_count: completedTask.recurrence_interval_count,
      recurrence_weekdays: completedTask.recurrence_weekdays,
      recurrence_end_type: completedTask.recurrence_end_type,
      recurrence_end_date: completedTask.recurrence_end_date,
      recurrence_end_count: completedTask.recurrence_end_count,
      recurrence_instance_date: nextDueDateStr,
      recurrence_exception: false,
    });

  if (spawnError) {
    console.error("Failed to spawn next sequential task occurrence:", spawnError.message);
  } else {
    console.log("Successfully generated the next sequential task occurrence:", nextDueDateStr);
  }
}

