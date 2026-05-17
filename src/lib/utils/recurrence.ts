export type RecurrenceIntervalType = "none" | "daily" | "weekly" | "monthly" | "yearly";
export type RecurrenceEndType = "never" | "date" | "count";

export interface RecurrenceRule {
  intervalType: RecurrenceIntervalType;
  intervalCount: number;
  weekdays?: string | null; // e.g. "MO,TH"
  endType: RecurrenceEndType;
  endDate?: string | Date | null;
  endCount?: number | null;
}

const WEEKDAY_MAP: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

const WEEKDAY_NAMES: Record<string, string> = {
  SU: "Sunday",
  MO: "Monday",
  TU: "Tuesday",
  WE: "Wednesday",
  TH: "Thursday",
  FR: "Friday",
  SA: "Saturday",
};

/**
 * Parses a comma-separated list of weekdays into numerical Javascript indices (0 = Sunday)
 */
export function parseWeekdays(weekdaysStr?: string | null): number[] {
  if (!weekdaysStr) return [];
  return weekdaysStr
    .split(",")
    .map((w) => w.trim().toUpperCase())
    .filter((w) => w in WEEKDAY_MAP)
    .map((w) => WEEKDAY_MAP[w]);
}

/**
 * Formats a Date to a safe ISO date string: YYYY-MM-DD
 */
export function formatToISODate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Generates an array of occurrence start dates for a recurring series based on recurrence rules.
 * Uses a rolling window (defaults to 1 year in the future) to prevent infinite databases bloats.
 */
export function generateOccurrences(
  startDate: Date,
  rule: RecurrenceRule,
  maxFutureDate?: Date
): Date[] {
  const occurrences: Date[] = [];
  
  if (rule.intervalType === "none") {
    return [new Date(startDate)];
  }

  // Set default rolling window to 1 year into the future
  const defaultMaxDate = new Date();
  defaultMaxDate.setFullYear(defaultMaxDate.getFullYear() + 1);
  const boundaryDate = maxFutureDate || defaultMaxDate;

  // Set end date limit if endType is 'date'
  let ruleEndDate: Date | null = null;
  if (rule.endType === "date" && rule.endDate) {
    ruleEndDate = new Date(rule.endDate);
  }

  const interval = Math.max(1, rule.intervalCount);
  const targetDays = parseWeekdays(rule.weekdays);

  const current = new Date(startDate.getTime());
  let count = 0;
  const maxIterations = 500; // Protection against infinite loops

  // 1. Daily Recurrence
  if (rule.intervalType === "daily") {
    while (current <= boundaryDate && (!ruleEndDate || current <= ruleEndDate)) {
      if (rule.endType === "count" && rule.endCount && count >= rule.endCount) {
        break;
      }
      occurrences.push(new Date(current));
      count++;
      
      current.setDate(current.getDate() + interval);
      if (count >= maxIterations) break;
    }
  }
  
  // 2. Weekly Recurrence
  else if (rule.intervalType === "weekly") {
    if (targetDays.length > 0) {
      // Custom weekdays: Mon + Wed, etc.
      // Find the start of the week of our current date (Sunday)
      const tempDate = new Date(current.getTime());
      
      while (tempDate <= boundaryDate && (!ruleEndDate || tempDate <= ruleEndDate)) {
        if (rule.endType === "count" && rule.endCount && count >= rule.endCount) {
          break;
        }

        // Loop through weekdays in the current week
        const currentWeekStart = new Date(tempDate.getTime());
        currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // Reset to Sunday of this week

        for (const dayIndex of targetDays) {
          const occDate = new Date(currentWeekStart.getTime());
          occDate.setDate(occDate.getDate() + dayIndex);
          
          // Make sure we only generate occurrences on or after the original start date
          if (occDate >= startDate && occDate <= boundaryDate && (!ruleEndDate || occDate <= ruleEndDate)) {
            if (rule.endType === "count" && rule.endCount && count >= rule.endCount) {
              break;
            }
            occurrences.push(occDate);
            count++;
          }
        }

        // Advance by interval weeks
        tempDate.setDate(tempDate.getDate() + (7 * interval));
        if (count >= maxIterations) break;
      }
    } else {
      // Standard weekly: repeats on the same day of the week
      while (current <= boundaryDate && (!ruleEndDate || current <= ruleEndDate)) {
        if (rule.endType === "count" && rule.endCount && count >= rule.endCount) {
          break;
        }
        occurrences.push(new Date(current));
        count++;

        current.setDate(current.getDate() + (7 * interval));
        if (count >= maxIterations) break;
      }
    }
  }
  
  // 3. Monthly Recurrence
  else if (rule.intervalType === "monthly") {
    const originalDay = startDate.getDate();
    while (current <= boundaryDate && (!ruleEndDate || current <= ruleEndDate)) {
      if (rule.endType === "count" && rule.endCount && count >= rule.endCount) {
        break;
      }
      occurrences.push(new Date(current));
      count++;

      // Advance month by month safely
      const nextMonth = current.getMonth() + interval;
      current.setMonth(nextMonth, 1); // Set to 1st first to prevent date wrap-around shifts
      
      // Calculate target month's maximum days (e.g. Feb has 28 days)
      const lastDayOfNextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
      current.setDate(Math.min(originalDay, lastDayOfNextMonth));
      
      if (count >= maxIterations) break;
    }
  }
  
  // 4. Yearly Recurrence
  else if (rule.intervalType === "yearly") {
    const originalMonth = startDate.getMonth();
    const originalDay = startDate.getDate();
    while (current <= boundaryDate && (!ruleEndDate || current <= ruleEndDate)) {
      if (rule.endType === "count" && rule.endCount && count >= rule.endCount) {
        break;
      }
      occurrences.push(new Date(current));
      count++;

      const nextYear = current.getFullYear() + interval;
      current.setFullYear(nextYear, originalMonth, 1);
      
      const lastDayOfNextYear = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
      current.setDate(Math.min(originalDay, lastDayOfNextYear));

      if (count >= maxIterations) break;
    }
  }

  // Ensure first date is present and sort ascendingly
  return occurrences.sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Returns a user-friendly text summary of the recurrence configuration
 */
export function getRecurrenceSummary(rule: RecurrenceRule): string {
  if (rule.intervalType === "none") {
    return "One-time event";
  }

  const intervalText = rule.intervalCount > 1 ? `every ${rule.intervalCount} ` : "every ";
  let frequencyText = "";
  
  if (rule.intervalType === "daily") {
    frequencyText = rule.intervalCount > 1 ? "days" : "day";
  } else if (rule.intervalType === "weekly") {
    if (rule.weekdays) {
      const days = rule.weekdays
        .split(",")
        .map((w) => WEEKDAY_NAMES[w.trim().toUpperCase()])
        .filter(Boolean);
        
      if (days.length === 7) {
        frequencyText = "day";
      } else if (days.length > 1) {
        const last = days.pop();
        frequencyText = `week on ${days.join(", ")} and ${last}`;
      } else {
        frequencyText = `week on ${days[0]}`;
      }
    } else {
      frequencyText = rule.intervalCount > 1 ? "weeks" : "week";
    }
  } else if (rule.intervalType === "monthly") {
    frequencyText = rule.intervalCount > 1 ? "months" : "month";
  } else if (rule.intervalType === "yearly") {
    frequencyText = rule.intervalCount > 1 ? "years" : "year";
  }

  let endText = "";
  if (rule.endType === "date" && rule.endDate) {
    const end = new Date(rule.endDate);
    endText = ` until ${end.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}`;
  } else if (rule.endType === "count" && rule.endCount) {
    endText = `, for ${rule.endCount} occurrences`;
  }

  return `Repeats ${intervalText}${frequencyText}${endText}`;
}
