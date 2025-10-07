<script>
  import { onMount } from 'svelte'
  import { supabase } from '$lib/supabaseClient'

  let ports = []
  let error = null
  let loading = true

  onMount(async () => {
    const { data, error: err } = await supabase.rpc('get_port_status')

    if (err) {
      error = err.message
      console.error('Supabase error:', err)
    } else {
      ports = data
    }

    loading = false
  })
</script>

<div class="p-8">
  <h1 class="text-3xl font-bold mb-6 text-gray-800">Machine Port Status</h1>

  {#if loading}
    <div class="flex justify-center items-center h-40">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

  {:else if error}
    <p class="text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>

  {:else if ports.length === 0}
    <p class="text-gray-500 italic">No data available.</p>

  {:else}
    <div class="overflow-x-auto shadow-lg rounded-xl border border-gray-200">
      <table class="min-w-full text-sm text-left text-gray-700">
        <thead class="bg-blue-600 text-white text-sm uppercase tracking-wider">
          <tr>
            <th class="px-4 py-3">ID</th>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Board</th>
            <th class="px-4 py-3">Port</th>
            <th class="px-4 py-3">Visible</th>
            <th class="px-4 py-3">Status</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200 bg-white">
          {#each ports as p, i}
            <tr class="hover:bg-blue-50 transition">
              <td class="px-4 py-3 font-medium text-gray-800">{p.id}</td>
              <td class="px-4 py-3">{p.name}</td>
              <td class="px-4 py-3">{p.board}</td>
              <td class="px-4 py-3">{p.port}</td>
              <td class="px-4 py-3">
                {#if p.visible}
                  <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Yes</span>
                {:else}
                  <span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">No</span>
                {/if}
              </td>
              <td class="px-4 py-3">
                {#if p.isactive === 'active'}
                  <span class="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Active
                  </span>
                {:else}
                  <span class="bg-gray-400 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Inactive
                  </span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
