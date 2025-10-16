<svelte:head>
  <title>Molds Health Dashboard</title>
</svelte:head>

<script>
  import MoldFilters from './MoldFilters.svelte';
  import MoldItem from './MoldItem.svelte';

  export let data; // { molds: [...], error?: string }

  let filter = 'all';
  let search = '';
  let expandedId = null;
  let sortOrder = 'desc';

  // Add derived status based on machine link
  $: moldsWithStatus = data.molds.map((m) => ({
    ...m,
    status: m.currentMachine ? 'In Use' : 'Idle'
  }));

  $: filtered = data.molds
  .map((m) => {
    // Find the earliest linked machine start date
    const earliest = m.linkedMachines?.length
      ? Math.min(
          ...m.linkedMachines
            .filter((lm) => lm.start) // only if a start date exists
            .map((lm) => new Date(lm.start).getTime())
        )
      : Infinity; // no history → put at the end

    return {
      ...m,
      status: m.currentMachine ? 'In Use' : 'Idle',
      earliestConnection: earliest,
    };
  })
  // Filter by status
  .filter((m) =>
    filter === 'inuse'
      ? m.status === 'In Use'
      : filter === 'idle'
      ? m.status === 'Idle'
      : true
  )
  // Filter by search text
  .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
  // Sort by earliest connection (oldest first)
  .sort((a, b) => a.earliestConnection - b.earliestConnection);


  function toggleExpand(id) {
    expandedId = expandedId === id ? null : id;
  }
</script>

<div class="p-6 bg-gray-50 text-gray-900">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">Mold Health Overview</h1>
      <p class="text-gray-500 text-sm">Monitor molds currently and historically linked to machines</p>
    </div>

    <MoldFilters {filter} {search}
      onFilter={(f) => (filter = f)}
      onSearch={(s) => (search = s)} />
  </div>

  <!-- Table -->
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    {#if data.error}
      <p class="text-red-600 bg-red-100 border border-red-300 p-3 rounded-lg">{data.error}</p>
    {:else if filtered.length === 0}
      <p class="text-gray-500 italic text-center py-10">No molds found.</p>
    {:else}
      <table class="min-w-full text-sm text-left text-gray-700">
        <thead class="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
          <tr>
            <th class="px-4 py-3 font-semibold cursor-pointer select-none" on:click={() => toggleSort('name')}>
              Mold
            </th>
            <th class="px-4 py-3 font-semibold">Current Machine</th>

            <th class="px-4 py-3 font-semibold">Status</th>
            <th class="px-4 py-3 text-right font-semibold w-10"></th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200 bg-white">
          {#each filtered as mold (mold.id)}
            <MoldItem
              {mold}
              expanded={expandedId === mold.id}
              toggle={() => toggleExpand(mold.id)}
            />
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>
