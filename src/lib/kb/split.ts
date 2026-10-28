// #4471 split into the problems it holds. causes.ts places a report by tenant; the desk's notes
// pull out the reports that describe a one-day move, which no tenant rule explains.
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
  const rest = merged.filter((r) => !oneDayMove.includes(r.id));
  const groups: ProblemGroup[] = groupByCause(rest, tenantOf).map(({ cause, ...g }) => ({ problem: cause, ...g }));
  if (moved.length) {
    const [g] = groupByCause(moved, () => undefined);
    groups.push({ ...g, problem: 'one-day' });
  }
  return groups.sort((a, b) => b.reports.length - a.reports.length);
}

// Rows in the export, before one id = one report.
export const rowsIn = (all: Report[], ticket: number) => all.filter((r) => r.mergedInto === ticket).length;
