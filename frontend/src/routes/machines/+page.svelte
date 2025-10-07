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

  onMount(async () => {
    const { data, error: err } = await supabase.rpc('get_port_status');

    if (err) {
      error = err.message;
      console.error('Supabase error:', err);
    } else {
      ports = data;
      filtered = ports;
    }

    loading = false;
  });

  function toggleExpand(key) {
    expanded = expanded === key ? null : key;
  }

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
      results = results.filter((p) => p.isactive === 'active');
    } else if (filter === 'inactive') {
      results = results.filter((p) => p.isactive !== 'active');
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-4 h-4 absolute left-3 top-2.5 text-gray-400"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name..."
          class="pl-9 pr-3 py-2 text-sm bg-white text-gray-900 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full"
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
        >
          All
        </button>
        <button
          class="px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none"
          class:bg-orange-500={filter === 'active'}
          class:text-white={filter === 'active'}
          class:text-gray-700={filter !== 'active'}
          on:click={() => setFilter('active')}
        >
          Active
        </button>
        <button
          class="px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none"
          class:bg-orange-500={filter === 'inactive'}
          class:text-white={filter === 'inactive'}
          class:text-gray-700={filter !== 'inactive'}
          on:click={() => setFilter('inactive')}
        >
          Inactive
        </button>
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
                on:click={() => toggleExpand(`${p.id}-${p.board}-${p.port}-${i}`)}
              >
                <td class="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td class="px-4 py-3">{p.board}</td>
                <td class="px-4 py-3">{p.port}</td>
                <td class="px-4 py-3">
                  {#if p.isactive === 'active'}
                    <span class="bg-green-500/90 text-white px-2 py-1 rounded-full text-xs font-medium">Active</span>
                  {:else}
                    <span class="bg-gray-300 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">Inactive</span>
                  {/if}
                </td>

                <!-- Chevron -->
                <td class="px-4 py-3 text-right">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="w-5 h-5 text-gray-500 transition-transform duration-300 inline-block"
                    style="transform: rotate({expanded === `${p.id}-${p.board}-${p.port}-${i}` ? 90 : 0}deg)"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </td>
              </tr>

              {#if expanded === `${p.id}-${p.board}-${p.port}-${i}`}
                <tr>
                  <td colspan="5" class="p-0">
                    <div transition:slide class="bg-gray-50 border-t border-gray-200">
                      <div class="p-6 text-center text-gray-600">
                        📊 <strong class="text-gray-800">{p.name}</strong> — Data visualization
                        <div class="mt-4 h-40 bg-gray-100 rounded-lg flex items-center justify-center shadow-inner">
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
