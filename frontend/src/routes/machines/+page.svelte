<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { slide } from 'svelte/transition';

  let ports = [];
  let filtered = [];
  let error = null;
  let loading = true;
  let expanded = null;
  let filter = 'all';
  let search = '';

  // Store all molds and per-machine caches
  let allMolds = [];
  let machineMolds = {}; // { key: [ { id, name, desc } ] }
  let loadingMolds = {}; // { key: boolean }

  // Load all machines and molds at startup
  onMount(async () => {
    try {
      const [{ data: machines, error: err1 }, { data: molds, error: err2 }] = await Promise.all([
        supabase.rpc('get_machine_activity_status'),
        supabase.rpc('get_molds_on_machine')
      ]);

      if (err1) throw err1;
      if (err2) throw err2;

      ports = machines ?? [];
      filtered = ports;
      allMolds = molds ?? [];
    } catch (e) {
      console.error('Supabase error:', e);
      error = e.message ?? String(e);
    } finally {
      loading = false;
    }
  });

  // Expand row & load molds (filter client-side)
  async function toggleExpand(key, machineName) {
    if (expanded === key) {
      expanded = null;
      return;
    }

    expanded = key;

    // Filter molds only once per machine
    if (!machineMolds[key]) {
      loadingMolds[key] = true;

      // Filter molds belonging to this machine
      const moldsForMachine = (allMolds ?? [])
        .filter((m) => m.machine === machineName)
        .flatMap((m) => {
          const arr = [];
          if (m.mold1_id && m.mold1_id !== 0) {
            arr.push({
              id: m.mold1_id,
              name: m.mold1_name,
              desc: m.mold1_desc
            });
          }
          if (m.mold2_id && m.mold2_id !== 0) {
            arr.push({
              id: m.mold2_id,
              name: m.mold2_name,
              desc: m.mold2_desc
            });
          }
          return arr;
        });

      machineMolds[key] = moldsForMachine;
      loadingMolds[key] = false;
    }
  }

  // Filters and search
  function setFilter(value) {
    filter = value;
    search = '';
    applyFilters();
  }

  function handleSearch(e) {
    search = e.target.value;
    filter = 'all';
    applyFilters();
  }

  function applyFilters() {
    let results = [...ports];

    if (filter === 'active') {
      results = results.filter((p) => p.is_active === 'active');
    } else if (filter === 'inactive') {
      results = results.filter((p) => p.is_active !== 'active');
    }

    if (search.trim() !== '') {
      const q = search.trim().toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(q));
    }

    filtered = results;
  }
</script>

<!-- Page Container -->
<div class="p-6 bg-gray-50 text-gray-900">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">Machine Status Overview</h1>
      <p class="text-gray-500 text-sm">Monitor and analyze all machines in real time</p>
    </div>

    <!-- Search + Filters -->
    <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
      <!-- Search -->
      <div class="relative w-full sm:w-64">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="2" stroke="currentColor"
             class="w-4 h-4 absolute left-3 top-2.5 text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z" />
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

      <!-- Filter bar -->
      <div class="flex bg-white rounded-full overflow-hidden border border-gray-300 shadow-sm">
        <button
          class="px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none"
          class:bg-orange-500={filter === 'all'}
          class:text-white={filter === 'all'}
          class:text-gray-700={filter !== 'all'}
          on:click={() => setFilter('all')}
        >All</button>
        <button
          class="px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none"
          class:bg-orange-500={filter === 'active'}
          class:text-white={filter === 'active'}
          class:text-gray-700={filter !== 'active'}
          on:click={() => setFilter('active')}
        >Active</button>
        <button
          class="px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none"
          class:bg-orange-500={filter === 'inactive'}
          class:text-white={filter === 'inactive'}
          class:text-gray-700={filter !== 'inactive'}
          on:click={() => setFilter('inactive')}
        >Inactive</button>
      </div>
    </div>
  </div>

  <!-- Table -->
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    {#if loading}
      <div class="flex justify-center items-center h-40">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
      </div>

    {:else if error}
      <p class="text-red-600 bg-red-100 border border-red-300 p-3 rounded-lg">{error}</p>

    {:else if filtered.length === 0}
      <p class="text-gray-500 italic text-center py-10">No data available.</p>

    {:else}
      <table class="min-w-full text-sm text-left text-gray-700">
        <thead class="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
          <tr>
            <th class="px-4 py-3 font-semibold">Machine</th>
            <th class="px-4 py-3 font-semibold">Board</th>
            <th class="px-4 py-3 font-semibold">Port</th>
            <th class="px-4 py-3 font-semibold">Status</th>
            <th class="px-4 py-3 text-right font-semibold w-10"></th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200 bg-white">
          {#each filtered as p, i (`${p.id}-${p.board}-${p.port}-${i}`)}
            {#key `${p.id}-${p.board}-${p.port}-${i}`}
              <tr
                class="hover:bg-gray-50 transition cursor-pointer"
                on:click={() => toggleExpand(`${p.id}-${p.board}-${p.port}-${i}`, p.name)}
              >
                <td class="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td class="px-4 py-3">{p.board}</td>
                <td class="px-4 py-3">{p.port}</td>
                <td class="px-4 py-3">
                  {#if p.is_active === 'active'}
                    <span class="bg-green-500/90 text-white px-2 py-1 rounded-full text-xs font-medium">Active</span>
                  {:else}
                    <span class="bg-gray-300 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">Inactive</span>
                  {/if}
                </td>

                <td class="px-4 py-3 text-right">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                       stroke-width="2" stroke="currentColor"
                       class="w-5 h-5 text-gray-500 transition-transform duration-300 inline-block"
                       style="transform: rotate({expanded === `${p.id}-${p.board}-${p.port}-${i}` ? 90 : 0}deg)">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </td>
              </tr>

              {#if expanded === `${p.id}-${p.board}-${p.port}-${i}`}
                <tr>
                  <td colspan="5" class="p-0">
                    <div transition:slide class="bg-gray-50 border-t border-gray-200">
                      <div class="p-6 text-center text-gray-600">
                        <strong class="text-gray-800">{p.name}</strong>

                        <!-- Added label for clarity -->
                        <p class="text-sm text-gray-500 mt-2 mb-3">
                          Currently installed molds in this machine:
                        </p>

                        <!-- Mold Pills -->
                        <div class="flex flex-wrap justify-center gap-2 mb-5">
                          {#if loadingMolds[`${p.id}-${p.board}-${p.port}-${i}`]}
                            <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-orange-500"></div>
                          {:else if machineMolds[`${p.id}-${p.board}-${p.port}-${i}`]?.length > 0}
                            {#each machineMolds[`${p.id}-${p.board}-${p.port}-${i}`] as mold}
                              <button
                                title={mold.desc}
                                class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition"
                              >
                                {mold.name}
                              </button>
                            {/each}
                          {:else}
                            <p class="text-gray-400 italic">No molds found for this machine.</p>
                          {/if}
                        </div>

                        <!-- Graph Placeholder -->
                        <div class="h-40 bg-gray-100 rounded-lg flex items-center justify-center shadow-inner">
                          <p class="text-gray-500 italic">Graph placeholder</p>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              {/if}
            {/key}
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>
