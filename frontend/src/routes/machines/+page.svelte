<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { slide } from "svelte/transition";
  import MachineShotChart from "$lib/components/MachineShotChart.svelte";
  import { goto } from "$app/navigation";

  let ports = [];
  let filtered = [];
  let error = null;
  let loading = true;
  let expanded = null;
  let filter = "all";
  let search = "";
  let selectedDate = "2020-10-01"; // 🆕 Default date parameter

  let allMolds = [];
  let machineMolds = {};
  let loadingMolds = {};

  // Active count
  let activeCount = 0;

  // 🆕 Fetch machine data for selected date
  async function fetchMachines() {
    loading = true;
    error = null;

    try {
      const [{ data: machines, error: err1 }, { data: molds, error: err2 }] =
        await Promise.all([
          supabase.rpc("get_machine_status_on_date", {
            simulation_date: selectedDate,
          }),
          supabase.rpc("get_molds_on_machine"),
        ]);

      if (err1) throw err1;
      if (err2) throw err2;

      ports = (machines ?? []).map((m) => ({
        ...m,
        active_status: m.active_status?.toLowerCase() ?? "inactive",
        operational_status: m.operational_status?.toLowerCase() ?? "standstill",
      }));

      filtered = ports;
      allMolds = molds ?? [];
      activeCount = ports.filter((p) => p.active_status === "active").length;
    } catch (e) {
      console.error("Supabase error:", e);
      error = e.message ?? String(e);
    } finally {
      loading = false;
    }
  }

  onMount(fetchMachines);

  function goToMold(moldId) {
    goto(`/molds?mold=${moldId}`);
  }

  async function toggleExpand(key, machineName) {
    if (expanded === key) {
      expanded = null;
      return;
    }

    expanded = key;

    if (!machineMolds[key]) {
      loadingMolds[key] = true;
      const moldsForMachine = (allMolds ?? [])
        .filter((m) => m.machine === machineName)
        .flatMap((m) => {
          const arr = [];
          if (m.mold1_id && m.mold1_id !== 0) {
            arr.push({
              id: m.mold1_id,
              name: m.mold1_name,
              desc: m.mold1_desc,
            });
          }
          if (m.mold2_id && m.mold2_id !== 0) {
            arr.push({
              id: m.mold2_id,
              name: m.mold2_name,
              desc: m.mold2_desc,
            });
          }
          return arr;
        });

      machineMolds[key] = moldsForMachine;
      loadingMolds[key] = false;
    }
  }

  function setFilter(value) {
    filter = value;
    search = "";
    applyFilters();
  }

  function handleSearch(e) {
    search = e.target.value;
    filter = "all";
    applyFilters();
  }

  function applyFilters() {
    let results = [...ports];

    if (filter === "active") {
      results = results.filter((p) => p.active_status === "active");
    } else if (filter === "inactive") {
      results = results.filter((p) => p.active_status === "inactive");
    } else if (filter === "operational") {
      results = results.filter((p) => p.operational_status === "inproduction");
    } else if (filter === "standstill") {
      results = results.filter((p) => p.operational_status === "standstill");
    }

    if (search.trim() !== "") {
      const q = search.trim().toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(q));
    }

    filtered = results;
  }
</script>

<svelte:head>
  <title>Machines | Machine Monitoring</title>
  <style>
    /* Active "ripple line" animation */
    @keyframes ringPulse {
      0% {
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
      }
      70% {
        box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
      }
    }

    .ring-pulse {
      position: relative;
      animation: ringPulse 2s ease-out infinite;
    }

    /* Optional: Make text and pill stay sharp */
    .status-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      border-radius: 9999px;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }
  </style>
</svelte:head>

<!-- Page Container -->
<div class="p-6 bg-gray-50 text-gray-900">
  <!-- Header & Filters -->
  <div class="flex flex-col gap-4 mb-6">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">
        Machine Status Overview
      </h1>
      <p class="text-gray-500 text-sm mb-2">
        Monitor and analyze all machines in real time
      </p>

      <!-- Active Machines Pill -->
      <div
        class="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-4 h-4 mr-1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {activeCount} Active Machines
      </div>
    </div>

    <!-- 🧮 Summary Bar -->
    <div class="flex flex-wrap items-center gap-4 text-sm">
      <div class="flex items-center gap-2">
        <span class="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
        <span
          >{ports.filter((p) => p.active_status === "active").length} Active</span
        >
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-block w-3 h-3 bg-gray-400 rounded-full"></span>
        <span
          >{ports.filter((p) => p.active_status === "inactive").length} Inactive</span
        >
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
        <span
          >{ports.filter((p) => p.operational_status === "inproduction").length}
          In Operation</span
        >
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-block w-3 h-3 bg-yellow-400 rounded-full"></span>
        <span
          >{ports.filter((p) => p.operational_status === "standstill").length} Standstill</span
        >
      </div>
    </div>

    <!-- 🔽 Filter + Search + Date Picker -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
    >
      <div class="flex gap-3 items-center">
        <!-- 🆕 Date picker -->

        <div class="relative w-60">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-4 h-4 absolute left-3 top-2.5 text-gray-400"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name..."
            class="pl-9 pr-3 py-2 text-sm bg-white text-gray-900 border border-gray-300 rounded-full
                   focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full"
            bind:value={search}
            on:input={handleSearch}
          />
        </div>
      </div>

      <!-- 🆕 Dropdown filter -->
      <div class="relative">
        <select
          bind:value={filter}
          on:change={() => applyFilters()}
          class="appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-full px-4 py-2 pr-8
                 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
        >
          <option value="all">All Machines</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="operational">In Operation</option>
          <option value="standstill">Standstill</option>
        </select>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  </div>

  <!-- Table -->
  <div
    class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
  >
    {#if loading}
      <div class="flex justify-center items-center h-40">
        <div
          class="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"
        ></div>
      </div>
    {:else if error}
      <p class="text-red-600 bg-red-100 border border-red-300 p-3 rounded-lg">
        {error}
      </p>
    {:else if filtered.length === 0}
      <p class="text-gray-500 italic text-center py-10">No data available.</p>
    {:else}
      <table class="min-w-full text-sm text-left text-gray-700">
        <thead
          class="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider"
        >
          <tr>
            <th class="px-4 py-3 font-semibold">Machine</th>
            <th class="px-4 py-3 font-semibold">Board</th>
            <th class="px-4 py-3 font-semibold">Port</th>
            <th class="px-4 py-3 font-semibold">Active Status</th>
            <th class="px-4 py-3 font-semibold">Operational</th>
            <th class="px-4 py-3 text-right font-semibold w-10"></th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200 bg-white">
          {#each filtered as p, i (`${p.id}-${p.board}-${p.port}-${i}`)}
            <tr
              class="hover:bg-gray-50 transition cursor-pointer"
              on:click={() =>
                toggleExpand(`${p.id}-${p.board}-${p.port}-${i}`, p.name)}
            >
              <td class="px-4 py-3 font-medium text-gray-900">{p.name}</td>
              <td class="px-4 py-3">{p.board}</td>
              <td class="px-4 py-3">{p.port}</td>

              <td class="px-4 py-3">
                {#if p.active_status === "active"}
                  <span
                    class="status-pill bg-green-500/90 text-white ring-pulse"
                  >
                    Active
                  </span>
                {:else}
                  <span class="status-pill bg-gray-300 text-gray-700">
                    Inactive
                  </span>
                {/if}
              </td>

              <td class="px-4 py-3">
                {#if p.operational_status === "inproduction"}
                  <span
                    class="bg-blue-500/90 text-white px-2 py-1 rounded-full text-xs font-medium"
                  >
                    In Operation
                  </span>
                {:else}
                  <span
                    class="bg-yellow-400/80 text-gray-900 px-2 py-1 rounded-full text-xs font-medium"
                  >
                    Standstill
                  </span>
                {/if}
              </td>

              <td class="px-4 py-3 text-right">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-5 h-5 text-gray-500 transition-transform duration-300 inline-block"
                  style="transform: rotate({expanded ===
                  `${p.id}-${p.board}-${p.port}-${i}`
                    ? 90
                    : 0}deg)"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </td>
            </tr>

            {#if expanded === `${p.id}-${p.board}-${p.port}-${i}`}
              <tr>
                <td colspan="6" class="p-0">
                  <div transition:slide class="bg-gray-50 border-t border-gray-200">
                    <div class="p-6 text-gray-700">
                    <!-- Machine Header -->
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                              stroke-width="2" stroke="currentColor" class="w-5 h-5 text-orange-500">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="M3 7h18M3 12h18M3 17h18" />
                          </svg>
                          {p.name}
                        </h3>
                        <p class="text-sm text-gray-500">Attached molds currently in this machine:</p>
                      </div>

                      <div class="flex flex-wrap justify-end gap-2">
                        {#if loadingMolds[`${p.id}-${p.board}-${p.port}-${i}`]}
                          <div
                            class="animate-spin rounded-full h-6 w-6 border-t-2 border-orange-500"
                          ></div>
                        {:else if machineMolds[`${p.id}-${p.board}-${p.port}-${i}`]?.length > 0}
                          {#each machineMolds[`${p.id}-${p.board}-${p.port}-${i}`] as mold}
                            <button
                              title={mold.desc}
                              class="px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-sm font-medium
                                    hover:bg-orange-100 hover:border-orange-300 transition shadow-sm"
                              on:click={() => goToMold(mold.id)}
                            >
                              <span class="font-semibold">{mold.name}</span>
                            </button>
                          {/each}
                        {:else}
                          <p class="text-gray-400 italic text-sm">No molds found for this machine.</p>
                        {/if}
                      </div>
                    </div>

                    <!-- Subtle divider -->
                    <div class="border-t border-gray-200 my-4"></div>

                    <!-- Legend -->
                    <div class="flex items-center gap-2 mb-4 text-sm text-gray-500">
                      <div class="w-4 h-4 bg-red-200 border border-red-400 rounded-sm"></div>
                      <span>
                        <span class="text-red-600 font-medium">Red</span> sections mean no shot time data available.
                      </span>
                    </div>

                    <!-- Chart -->
                    <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                      <MachineShotChart board={p.board} port={p.port} />
                    </div>
                  </div>


                  </td>
                </tr>
              {/if}
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>
