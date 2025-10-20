<script>
  import { page } from "$app/stores";
  import { onMount, tick } from "svelte";
  import { get } from "svelte/store";
  import MoldFilters from "./MoldFilters.svelte";
  import MoldItem from "./MoldItem.svelte";

  export let data; // { molds: [...], error?: string }

  let filter = "all";
  let search = "";
  let expandedId = null;

  // Derived + filtered list
  $: filtered = (data.molds ?? [])
    .map((m) => {
      const earliest = m.linkedMachines?.length
        ? Math.min(
            ...m.linkedMachines
              .filter((lm) => lm.start)
              .map((lm) => new Date(lm.start).getTime()),
          )
        : Infinity;
      return {
        ...m,
        status: m.currentMachine ? "In Use" : "Idle",
        earliestConnection: earliest,
      };
    })
    .filter((m) =>
      filter === "inuse"
        ? m.status === "In Use"
        : filter === "idle"
          ? m.status === "Idle"
          : true,
    )
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.earliestConnection - b.earliestConnection);

  function toggleExpand(id) {
    expandedId = expandedId === id ? null : id;
  }

  // Smooth scroll + soft highlight
  onMount(async () => {
    const moldIdParam = get(page).url.searchParams.get("mold");
    if (!moldIdParam) return;

    expandedId = parseInt(moldIdParam, 10);
    await tick(); // wait for DOM to render the rows

    const row = document.getElementById(`mold-${moldIdParam}`);
    if (!row) return;

    row.scrollIntoView({ behavior: "smooth", block: "center" });

    // Apply highlight to all TDs (reliable across browsers)
    const tds = row.querySelectorAll("td");
    tds.forEach((td) => td.classList.add("highlight-cell"));
    setTimeout(() => {
      tds.forEach((td) => td.classList.remove("highlight-cell"));
    }, 3600);
  });

  // Optional: expose handlers for filters
  function onFilter(f) {
    filter = f;
  }
  function onSearch(s) {
    search = s;
  }
</script>

<svelte:head>
  <title>Molds Health Dashboard</title>
</svelte:head>

<div class="p-6 bg-gray-50 text-gray-900">
  <div
    class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4"
  >
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">Mold Health Overview</h1>
      <p class="text-gray-500 text-sm">
        Monitor molds currently and historically linked to machines
      </p>
    </div>

    <MoldFilters {filter} {search} {onFilter} {onSearch} />
  </div>

  <div
    class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
  >
    {#if data.error}
      <p class="text-red-600 bg-red-100 border border-red-300 p-3 rounded-lg">
        {data.error}
      </p>
    {:else if filtered.length === 0}
      <p class="text-gray-500 italic text-center py-10">No molds found.</p>
    {:else}
      <table class="min-w-full table-fixed text-sm text-left text-gray-700">
        <!-- Lock column widths so pills don’t drift -->
        <colgroup>
          <col style="width: 28%" />
          <!-- Mold -->
          <col style="width: 44%" />
          <!-- Current Machine -->
          <col style="width: 20%" />
          <!-- Status -->
          <col style="width: 8%" />
          <!-- Chevron -->
        </colgroup>

        <thead
          class="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider"
        >
          <tr>
            <th class="px-4 py-3 font-semibold">Mold</th>
            <th class="px-4 py-3 font-semibold">Current Machine</th>
            <th class="px-4 py-3 font-semibold text-center">Status</th>
            <th class="px-4 py-3 font-semibold text-right w-10"></th>
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

<style>
  @keyframes fullRowGlow {
    0% {
      background-color: #fff7ed; /* orange-50 */
      box-shadow: 0 0 0 0 rgba(249, 115, 22, 0);
    }
    30% {
      background-color: #fed7aa; /* orange-200 */
      box-shadow: 0 0 12px 2px rgba(249, 115, 22, 0.25);
    }
    70% {
      background-color: #fed7aa;
      box-shadow: 0 0 12px 4px rgba(249, 115, 22, 0.3);
    }
    100% {
      background-color: transparent;
      box-shadow: none;
    }
  }

  .glow-bg {
    border-radius: 0.5rem;
    transition: background-color 0.4s ease-in-out;
  }

  .animate-glow {
    animation: fullRowGlow 3s ease-in-out;
  }
</style>
