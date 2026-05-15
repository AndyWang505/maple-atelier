// Asia/Taipei is UTC+8 with no DST — safe to use a fixed offset for week-boundary math.
const TPE_OFFSET_MS = 8 * 60 * 60 * 1000;
const BI_WEEK_MS = 14 * 24 * 60 * 60 * 1000;

/** Returns the Date for this week's Monday 00:00 in Asia/Taipei, expressed as UTC. */
export function getWeekStartTPE(now: Date = new Date()): Date {
  const tpe = new Date(now.getTime() + TPE_OFFSET_MS);
  const day = tpe.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysFromMon = (day + 6) % 7;
  const monStart = new Date(tpe);
  monStart.setUTCHours(0, 0, 0, 0);
  monStart.setUTCDate(monStart.getUTCDate() - daysFromMon);
  return new Date(monStart.getTime() - TPE_OFFSET_MS);
}

/**
 * Returns the previous completed 14-day window anchored to Unix epoch TPE (1970-01-01 00:00 +08:00).
 * Period index = floor(nowTPE / 14d); previous = index-1.
 * Expressed as UTC Dates.
 */
export function getPrevBiWeekWindow(now: Date = new Date()): { start: Date; end: Date } {
  const nowTpeMs = now.getTime() + TPE_OFFSET_MS;
  const periodIndex = Math.floor(nowTpeMs / BI_WEEK_MS);
  return {
    start: new Date((periodIndex - 1) * BI_WEEK_MS - TPE_OFFSET_MS),
    end: new Date(periodIndex * BI_WEEK_MS - TPE_OFFSET_MS),
  };
}
