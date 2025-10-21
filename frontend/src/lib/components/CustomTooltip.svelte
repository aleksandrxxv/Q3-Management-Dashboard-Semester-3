<script>
  export let active;
  export let payload;
  export let label;

  // Derive tooltip data safely
  let d = null;
  $: if (active && payload && payload.length) {
    d = payload[0].payload;
  } else {
    d = null;
  }
</script>

{#if d}
  <div class="bg-white text-gray-800 p-2 rounded shadow text-sm border border-gray-200">
    <p><strong>{d.mold_name}</strong></p>
    <p>Machine: {d.machine}</p>
    <p>Start: {d.latest_start_date ? new Date(d.latest_start_date).toLocaleDateString() : '—'}</p>
    <p>End: {d.latest_end_date ? new Date(d.latest_end_date).toLocaleDateString() : 'Active'}</p>
    <p>Duration: {d.durationDays} days</p>
  </div>
{/if}
