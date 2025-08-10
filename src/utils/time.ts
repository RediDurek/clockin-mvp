import type { Pause } from '../adapters/StorageAdapter';

export function mergePauses(pauses: Pause[]): Pause[] {
  if (pauses.length === 0) return [];
  // Sort by start time
  const sorted = [...pauses].sort((a, b) => a.start - b.start);
  const merged: Pause[] = [];
  for (const pause of sorted) {
    if (merged.length === 0) {
      merged.push({ ...pause });
      continue;
    }
    const last = merged[merged.length - 1];
    if (last.end !== undefined && pause.start <= last.end) {
      // Overlapping or adjacent pause: extend end if necessary
      if (pause.end && (!last.end || pause.end > last.end)) {
        last.end = pause.end;
      }
    } else {
      merged.push({ ...pause });
    }
  }
  return merged;
}

export function durationMs(start: number, end: number | undefined): number {
  if (!end) return 0;
  return Math.max(0, end - start);
}

export function totalPauseMs(pauses: Pause[]): number {
  return mergePauses(pauses).reduce((acc, p) => {
    if (p.end) {
      return acc + (p.end - p.start);
    }
    return acc;
  }, 0);
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let result = '';
  if (hours > 0) {
    result += `${hours}h `;
  }
  result += `${minutes}m`;
  return result;
}
