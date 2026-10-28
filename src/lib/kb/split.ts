// #4471 split into the problems it holds, counted with the desk's own view (CauseTable): every report
// stays filed under its tenant cause. The reports the desk read as a one-day move (desk-notes.json)
// are a problem of their own, counted again on their own row and footnoted under the cause they sit in.
import { groupByCause, uniqueById, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = CauseGroup['cause'] | 'one-day';

export type ProblemGroup = Omit<CauseGroup, 'cause'> & { problem: Problem };

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  const groups: ProblemGroup[] = groupByCause(merged, tenantOf).map(({ cause, ...g }) => ({ problem: cause, ...g }));
  if (moved.length) {
    const [g] = groupByCause(moved, () => undefined);
    groups.push({ ...g, problem: 'one-day' });
  }
  return groups.sort((a, b) => b.reports.length - a.reports.length);
}

// Rows in the export, before one id = one report.
export const rowsIn = (all: Report[], ticket: number) => all.filter((r) => r.mergedInto === ticket).length;
