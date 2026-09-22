// ---------------------------------------------------------------------------
// Weekly streak tracking.
//
// A "week" is identified by its Monday date (YYYY-MM-DD). A student keeps their
// streak alive by answering at least one quiz question in a week. If a whole
// week passes with no activity, the streak resets to zero and starts again on
// the next active week.
// ---------------------------------------------------------------------------

const KEY = "study-streak-weeks";

/** The Monday (local time) of the week containing `date`, as YYYY-MM-DD. */
export function weekStart(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  d.setDate(d.getDate() + diff);
  return toKey(d);
}

function toKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Weeks (Monday keys) in which the student was active. */
export function getActiveWeeks(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item): item is string => typeof item === "string")
      .sort();
  } catch {
    return [];
  }
}

/** Record activity for the current week. Returns the updated list. */
export function recordWeeklyActivity(now: Date = new Date()): string[] {
  const current = weekStart(now);
  const weeks = getActiveWeeks();
  if (!weeks.includes(current)) {
    weeks.push(current);
    weeks.sort();
    localStorage.setItem(KEY, JSON.stringify(weeks));
  }
  return weeks;
}

/**
 * Current streak in weeks.
 *
 * The streak counts back from the current week (or the previous week, since a
 * student is allowed to be partway through the current week). Any missing week
 * in that back-run breaks the streak.
 */
export function getWeekStreak(now: Date = new Date()): number {
  const weeks = new Set(getActiveWeeks());
  if (weeks.size === 0) return 0;

  const thisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Start from this week if active, otherwise from last week.
  const cursor = new Date(thisWeek);
  if (!weeks.has(weekStart(cursor))) {
    cursor.setDate(cursor.getDate() - 7);
  }
  if (!weeks.has(weekStart(cursor))) return 0;

  let streak = 0;
  while (weeks.has(weekStart(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

/** Best streak ever recorded, in weeks. */
export function getBestWeekStreak(now: Date = new Date()): number {
  const weeks = getActiveWeeks();
  if (weeks.length === 0) return 0;
  let best = 0;
  let run = 0;
  let previous: Date | null = null;
  for (const key of weeks) {
    const date = new Date(`${key}T00:00:00`);
    if (previous) {
      const gapDays = Math.round(
        (date.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24),
      );
      run = gapDays === 7 ? run + 1 : 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    previous = date;
  }
  // A run that ended long ago is still a best — that's intentional.
  return Math.max(best, getWeekStreak(now));
}

/** Has the student already answered a quiz this week? */
export function hasActivityThisWeek(now: Date = new Date()): boolean {
  return getActiveWeeks().includes(weekStart(now));
}
