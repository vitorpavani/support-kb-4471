<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { rowsIn, splitTicket, type Problem } from '#lib/kb/split';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  // Where each problem is filed: issue number in this repo.
  let { ticket, filed }: { ticket: number; filed: Partial<Record<Problem, number>> } = $props();

  const all = reports as Report[];
  const groups = $derived(splitTicket(all, ticket, tenantOf, notes.oneDayMove));
  const total = $derived(groups.reduce((n, g) => n + g.reports.length, 0));
  const rows = $derived(rowsIn(all, ticket));
  const mistagged = (g: (typeof groups)[number]) =>
    g.problem === 'one-day' ? null : g.reports.length - (g.taggedAs[g.problem] ?? 0);
</script>

<p class="sum">
  <strong>{total}</strong> reports in #{ticket} ({rows} rows in the export, {rows - total} repeated) ·
  <strong>{groups.length}</strong> problems
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>intake tag wrong</th><th>ticket</th></tr></thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td><strong>{g.reports.length}</strong></td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{mistagged(g) ?? '—'}</td>
        <td>{#if filed[g.problem]}<a href="https://github.com/vitorpavani/support-kb-4471/issues/{filed[g.problem]}">#{filed[g.problem]}</a>{:else}not filed{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
</style>
