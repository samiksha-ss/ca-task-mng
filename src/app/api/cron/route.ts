import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createNotification } from "@/services/notification-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Simple authorization guard using a header or secret if needed, or open for testing
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });

  try {
    // 1. Fetch all parent tasks that have recurrence configured
    const { data: parentTasks, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .not("recurrence_interval", "eq", "none");

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    const now = new Date();
    const spawnedCount = [];

    for (const parent of parentTasks) {
      const lastSpawn = parent.recurrence_last_created_at 
        ? new Date(parent.recurrence_last_created_at) 
        : new Date(parent.created_at);

      let shouldSpawn = false;
      const daysDiff = Math.floor((now.getTime() - lastSpawn.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate if the interval threshold is met
      switch (parent.recurrence_interval) {
        case "weekly":
          shouldSpawn = daysDiff >= 7;
          break;
        case "monthly":
          shouldSpawn = daysDiff >= 30;
          break;
        case "quarterly":
          shouldSpawn = daysDiff >= 90;
          break;
        case "annually":
          shouldSpawn = daysDiff >= 365;
          break;
      }

      if (shouldSpawn) {
        // Calculate new dates
        const newStartDate = new Date().toISOString().slice(0, 10);
        let newDueDate = null;

        if (parent.start_date && parent.due_date) {
          const parentStart = new Date(parent.start_date);
          const parentDue = new Date(parent.due_date);
          const gapMs = parentDue.getTime() - parentStart.getTime();
          const newDue = new Date(Date.now() + gapMs);
          newDueDate = newDue.toISOString().slice(0, 10);
        }

        // 2. Insert cloned task (cloned child task has interval 'none' to avoid infinite recursive loops)
        const { data: childTask, error: insertError } = await supabase
          .from("tasks")
          .insert({
            title: `${parent.title} (Recurring)`,
            description: parent.description,
            company_id: parent.company_id,
            team_id: parent.team_id,
            assigned_to: parent.assigned_to,
            created_by: parent.created_by,
            priority: parent.priority,
            status: "todo",
            estimated_minutes: parent.estimated_minutes,
            billable: parent.billable,
            start_date: newStartDate,
            due_date: newDueDate,
            recurrence_interval: "none",
            recurrence_parent_id: parent.id,
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Failed to spawn child task for parent ${parent.id}:`, insertError.message);
          continue;
        }

        // 3. Update parent task recurrence timestamp
        await supabase
          .from("tasks")
          .update({ recurrence_last_created_at: now.toISOString() })
          .eq("id", parent.id);

        // 4. Dispatch alert notification to assignee (or creator if unassigned)
        const targetUserId = parent.assigned_to || parent.created_by;
        if (targetUserId) {
          await supabase.from("notifications").insert({
            user_id: targetUserId,
            title: "🔄 Recurring Task Created",
            message: `A new instance of task "${parent.title}" has been automatically generated according to your scheduled recurrence cycle.`,
            link: `/tasks/${childTask.id}`,
            read: false,
          });
        }

        spawnedCount.push({
          parentTitle: parent.title,
          childId: childTask.id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: parentTasks.length,
      spawned: spawnedCount.length,
      details: spawnedCount,
    });
  } catch (error) {
    console.error("Cron recurrence error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
