<script>
  import { onMount } from 'svelte'
  import { supabase } from '$lib/supabaseClient'
  import { slide } from 'svelte/transition'

  let ports = []
  let filtered = []
  let error = null
  let loading = true
  let expanded = new Set()
  let filter = 'all' // all | active | inactive
  let search = '' // search query

  onMount(async () => {
    const { data, error: err } = await supabase.rpc('get_port_status')

    if (err) {
      error = err.message
      console.error('Supabase error:', err)
    } else {
      ports = data
      filtered = ports
    }

    loading = false
  })

  function toggleExpand(key) {
    const newSet = new Set(expanded)
    newSet.has(key) ? newSet.delete(key) : newSet.add(key)
    expanded = newSet
  }

  // Filter buttons
  function setFilter(value) {
    filter = value
    search = '' // reset search
    applyFilters()
  }

  // Search handler
  function handleSearch(e) {
    search = e.target.value
    filter = 'all' // always show all when searching
    applyFilters()
  }

  // Combine filtering logic
  function applyFilters() {
    let results = [...ports]

    if (filter === 'active') {
      results = results.filter((p) => p.isactive === 'active')
    } else if (filter === 'inactive') {
      results = results.filter((p) => p.isactive !== 'active')
    }

    if (search.trim() !== '') {
      const q = search.trim().toLowerCase()
      results = results.filter((p) => p.name.toLowerCase().includes(q))
    }

    filtered = results
  }
</script>

<div class="min-h-screen bg-gray-100 p-8">
  <div class="max-w-6xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
    <header class="px-8 py-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">Machine Port Status</h1>
        <p class="text-gray-500 text-sm mt-1">Overview of all monitored machine ports</p>
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <!-- Search input -->
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
            class="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 w-full"
            bind:value={search}
            on:input={handleSearch}
          />
        </div>

        <!-- Filter bar -->
        <div class="flex bg-gray-100 rounded-full overflow-hidden border border-gray-200 shadow-sm">
          <button
            class="px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none"
            class:bg-white={filter === 'all'}
            class:text-gray-900={filter === 'all'}
            class:text-gray-500={filter !== 'all'}
            on:click={() => setFilter('all')}
          >
            All
          </button>
          <button
            class="px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none"
            class:bg-white={filter === 'active'}
            class:text-emerald-700={filter === 'active'}
            class:text-gray-500={filter !== 'active'}
            on:click={() => setFilter('active')}
          >
            Active
          </button>
          <button
            class="px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none"
            class:bg-white={filter === 'inactive'}
            class:text-gray-700={filter === 'inactive'}
            class:text-gray-500={filter !== 'inactive'}
            on:click={() => setFilter('inactive')}
          >
            Inactive
          </button>
        </div>
      </div>
    </header>

    <section class="p-8">
      {#if loading}
        <div class="flex justify-center items-center h-40">
          <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-gray-500"></div>
        </div>

      {:else if error}
        <p class="text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>

      {:else if filtered.length === 0}
        <p class="text-gray-500 italic">No data available.</p>

      {:else}
        <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table class="min-w-full text-sm text-left text-gray-700">
            <thead class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th class="px-4 py-3 font-semibold">ID</th>
                <th class="px-4 py-3 font-semibold">Name</th>
                <th class="px-4 py-3 font-semibold">Board</th>
                <th class="px-4 py-3 font-semibold">Port</th>
                <th class="px-4 py-3 font-semibold">Visible</th>
                <th class="px-4 py-3 font-semibold">Status</th>
                <th class="px-4 py-3 text-right font-semibold w-10"></th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-100 bg-white">
              {#each filtered as p, i (`${p.id}-${p.board}-${p.port}-${i}`)}
                <tr
                  class="hover:bg-gray-50 transition cursor-pointer"
                  on:click={() => toggleExpand(`${p.id}-${p.board}-${p.port}-${i}`)}
                >
                  <td class="px-4 py-3 font-medium text-gray-900">{p.id}</td>
                  <td class="px-4 py-3">{p.name}</td>
                  <td class="px-4 py-3">{p.board}</td>
                  <td class="px-4 py-3">{p.port}</td>
                  <td class="px-4 py-3">
                    {#if p.visible}
                      <span class="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">Yes</span>
                    {:else}
                      <span class="bg-rose-100 text-rose-800 px-2 py-1 rounded-full text-xs font-medium">No</span>
                    {/if}
                  </td>
                  <td class="px-4 py-3">
                    {#if p.isactive === 'active'}
                      <span class="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium">Active</span>
                    {:else}
                      <span class="bg-gray-400 text-white px-2 py-1 rounded-full text-xs font-medium">Inactive</span>
                    {/if}
                  </td>

                  <!-- Chevron arrow toggle -->
                  <td class="px-4 py-3 text-right">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      class="w-5 h-5 text-gray-800 transition-transform duration-300 inline-block"
                      style="transform: rotate({expanded.has(`${p.id}-${p.board}-${p.port}-${i}`) ? 90 : 0}deg)"
                    >
                      <path fill-rule="evenodd" d="M6 6L14 10L6 14V6Z" clip-rule="evenodd" />
                    </svg>
                  </td>
                </tr>

                {#if expanded.has(`${p.id}-${p.board}-${p.port}-${i}`)}
                  <tr>
                    <td colspan="7" class="p-0">
                      <div transition:slide class="bg-gray-50 border-t border-gray-200">
                        <div class="p-8 text-center text-gray-500">
                          📊 <strong>{p.name}</strong> — Data visualization
                          <div class="mt-4 h-40 bg-gray-200 rounded-lg flex items-center justify-center shadow-inner">
                            <p class="text-gray-600 italic">Graph placeholder</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                {/if}
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </section>
  </div>
</div>

<style>
  :global(body) {
    background-color: #f3f4f6;
    font-family: 'Inter', sans-serif;
  }

  button:hover {
    background-color: #f9fafb;
  }
</style>
