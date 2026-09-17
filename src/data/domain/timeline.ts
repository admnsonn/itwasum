import type { SeededRng } from '../../utils/seededRandom';

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export function formatIdDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${date.getDate()} ${months[date.getDate() ? date.getMonth() : 0]} ${date.getFullYear()}`.replace(
    /^(\d+) /,
    `${String(date.getDate()).padStart(1, ' ')} `
  );
}

export function formatIdDateFixed(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export interface TimelineStepSpec {
  id: string;
  title: string;
  minGapDays: number;
  maxGapDays: number;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: Date;
  label: string;
}

const DEFAULT_AUDIT_STEPS: TimelineStepSpec[] = [
  { id: 'sprin', title: 'Sprin / Surat Tugas terbit', minGapDays: 0, maxGapDays: 0 },
  { id: 'pelaksanaan', title: 'Pelaksanaan pemeriksaan', minGapDays: 7, maxGapDays: 21 },
  { id: 'lhp', title: 'LHP terbit', minGapDays: 14, maxGapDays: 30 },
  { id: 'tl', title: 'Batas tindak lanjut', minGapDays: 60, maxGapDays: 60 },
];

export function makeTimeline(
  rng: SeededRng,
  anchor: Date,
  steps: TimelineStepSpec[] = DEFAULT_AUDIT_STEPS
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  let cursor = new Date(anchor.getTime());
  for (const step of steps) {
    const gap = step.maxGapDays === step.minGapDays ? step.minGapDays : rng.int(step.minGapDays, step.maxGapDays + 1);
    cursor = addDaysSafe(cursor, gap);
    events.push({
      id: step.id,
      title: step.title,
      date: new Date(cursor.getTime()),
      label: formatIdDateFixed(cursor),
    });
  }
  return events;
}

function addDaysSafe(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export function tlDeadlineFromST(tanggalTerbitST: Date, days = 60): Date {
  return addDaysSafe(tanggalTerbitST, days);
}
